import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { Decimal } from "@prisma/client/runtime/library";

interface AuthUser {
  userId?: string;
  id?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult || !authResult.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (authResult.user as AuthUser).userId || (authResult.user as AuthUser).id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { companySymbol, quantity, priceType = "MARKET" } = body;

    // Validate input
    if (!companySymbol || !quantity) {
      return NextResponse.json(
        { error: "Company symbol and quantity are required" },
        { status: 400 }
      );
    }

    if (quantity <= 0 || quantity % 100 !== 0) {
      return NextResponse.json(
        { error: "Quantity must be a positive multiple of 100" },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find the company by symbol
      const company = await tx.company.findFirst({
        where: {
          symbol: companySymbol,
          isVerified: true,
        },
        select: {
          id: true,
          symbol: true,
          name: true,
          sharePrice: true,
          closingPrice: true,
          availableShares: true,
          totalShares: true,
        },
      });

      if (!company) {
        throw new Error("Company not found or not verified");
      }

      // 2. Determine the price to use
      const price = company.closingPrice || company.sharePrice;
      if (!price || Number(price) <= 0) {
        throw new Error("Invalid share price for this company");
      }

      // 3. Check available shares
      const availableShares = company.availableShares ? Number(company.availableShares) : 0;
      if (availableShares < quantity) {
        throw new Error(`Insufficient shares available. Only ${availableShares} shares available`);
      }

      // 4. Calculate total amount
      const priceDecimal = new Decimal(price.toString());
      const totalAmount = priceDecimal.mul(quantity);

      // 5. Get user's wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new Error("Wallet not found. Please contact support.");
      }

      // 6. Check balance
      if (new Decimal(wallet.balance.toString()).lessThan(totalAmount)) {
        throw new Error(
          `Insufficient balance. Required: Rwf ${totalAmount.toFixed(2)}, Available: Rwf ${wallet.balance.toString()}`
        );
      }

      // 7. Create trade record
      const trade = await tx.trade.create({
        data: {
          userId,
          companyId: company.id,
          type: "BUY",
          status: "EXECUTED",
          priceType,
          quantity,
          requestedPrice: priceDecimal,
          executedPrice: priceDecimal,
          executedQuantity: quantity,
          totalAmount,
          fees: new Decimal(0), // Can add trading fees here
          executedAt: new Date(),
        },
      });

      // 8. Update user's wallet balance
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: {
            decrement: totalAmount,
          },
        },
      });

      // 9. Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          type: "BUY_SHARES",
          amount: totalAmount,
          status: "COMPLETED",
          reference: `TRADE-${trade.id}`,
          description: `Purchase of ${quantity} shares of ${company.symbol} at Rwf ${priceDecimal.toFixed(2)} per share`,
          metadata: {
            tradeId: trade.id,
            companyId: company.id,
            companySymbol: company.symbol,
            quantity,
            pricePerShare: priceDecimal.toNumber(),
          },
        },
      });

      // 10. Update or create portfolio entry
      const existingPortfolio = await tx.portfolio.findUnique({
        where: {
          userId_companyId: {
            userId,
            companyId: company.id,
          },
        },
      });

      if (existingPortfolio) {
        // Update existing portfolio
        const newQuantity = existingPortfolio.quantity + quantity;
        const previousInvested = new Decimal(existingPortfolio.totalInvested.toString());
        const newTotalInvested = previousInvested.add(totalAmount);
        const newAverageBuyPrice = newTotalInvested.div(newQuantity);

        await tx.portfolio.update({
          where: {
            userId_companyId: {
              userId,
              companyId: company.id,
            },
          },
          data: {
            quantity: newQuantity,
            averageBuyPrice: newAverageBuyPrice,
            totalInvested: newTotalInvested,
          },
        });
      } else {
        // Create new portfolio entry
        await tx.portfolio.create({
          data: {
            userId,
            companyId: company.id,
            quantity,
            averageBuyPrice: priceDecimal,
            totalInvested: totalAmount,
          },
        });
      }

      // 11. Update company's available shares and trading data
      const newAvailableShares = BigInt(availableShares - quantity);
      const currentTradedVolume = company.totalShares
        ? new Decimal((Number(company.totalShares) - Number(newAvailableShares)).toString())
        : new Decimal(quantity.toString());
      
      await tx.company.update({
        where: { id: company.id },
        data: {
          availableShares: newAvailableShares,
          tradedVolume: currentTradedVolume,
          tradedValue: {
            increment: totalAmount,
          },
          snapshotDate: new Date(),
        },
      });

      // 12. Get updated wallet balance
      const updatedWallet = await tx.wallet.findUnique({
        where: { userId },
      });

      return {
        trade,
        company: {
          id: company.id,
          symbol: company.symbol,
          name: company.name,
        },
        transaction: {
          quantity,
          pricePerShare: priceDecimal.toNumber(),
          totalAmount: totalAmount.toNumber(),
        },
        newBalance: updatedWallet?.balance.toString() || "0",
      };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully purchased ${quantity} shares of ${result.company.symbol}`,
      data: result,
    });

  } catch (error) {
    console.error("Trade error:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to execute trade" },
      { status: 500 }
    );
  }
}
