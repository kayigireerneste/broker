import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/apiAuth";

// Mock MTN Mobile Money Integration
// In production, replace this with actual MTN MoMo API calls
async function mockMTNDeposit(
  phoneNumber: string,
  amount: number,
  reference: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock validation
  if (amount < 500) {
    return { success: false, error: "Minimum deposit amount is 500 RWF" };
  }

  if (amount > 5000000) {
    return { success: false, error: "Maximum deposit amount is 5,000,000 RWF" };
  }

  // Simulate 95% success rate
  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {
    return {
      success: true,
      transactionId: `MTN${reference}${Math.floor(Math.random() * 1000)}`,
    };
  } else {
    return {
      success: false,
      error: "Transaction failed. Please try again.",
    };
  }
}

// POST /api/wallet/deposit - Deposit money to wallet
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = auth.userId; // Extract userId for type safety

    const body = await req.json();
    const { amount, paymentMethodId } = body;
    const numericAmount = Number(amount);

    // Validate amount
    if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    // Get payment method
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id: paymentMethodId, userId: userId, isActive: true },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method not found or inactive" },
        { status: 404 }
      );
    }

    // Generate unique reference
    const reference = `DEP${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // Process payment based on payment method type
    let paymentResult: { success: boolean; transactionId?: string; error?: string };

    if (paymentMethod.type === "MOBILE_MONEY") {
      paymentResult = await mockMTNDeposit(
        paymentMethod.accountNumber,
        numericAmount,
        reference
      );
    } else {
      // For other payment types, simulate instant success
      paymentResult = {
        success: true,
        transactionId: `${paymentMethod.type}${Date.now()}`,
      };
    }

    if (!paymentResult.success) {
      // Create failed transaction record
      await prisma.transaction.create({
        data: {
          userId: userId,
          type: "DEPOSIT",
          amount: new Prisma.Decimal(numericAmount),
          status: "FAILED",
          paymentMethod: `${paymentMethod.type} - ${paymentMethod.provider || ""}`,
          reference,
          description: paymentResult.error || "Deposit failed",
          metadata: {
            paymentMethodId,
            accountNumber: paymentMethod.accountNumber,
            error: paymentResult.error,
          },
        },
      });

      return NextResponse.json(
        { error: paymentResult.error || "Deposit failed" },
        { status: 400 }
      );
    }

    // Start a transaction to update wallet and create transaction record
    const result = await prisma.$transaction(async (tx) => {
      // Get or create wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId: userId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId: userId,
            balance: new Prisma.Decimal(0),
            lockedBalance: new Prisma.Decimal(0),
          },
        });
      }

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { userId: userId },
        data: {
          balance: {
            increment: new Prisma.Decimal(numericAmount),
          },
        },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: userId,
          type: "DEPOSIT",
          amount: new Prisma.Decimal(numericAmount),
          status: "COMPLETED",
          paymentMethod: `${paymentMethod.type} - ${paymentMethod.provider || ""}`,
          reference,
          description: `Deposit via ${paymentMethod.provider || paymentMethod.type}`,
          metadata: {
            paymentMethodId,
            accountNumber: paymentMethod.accountNumber,
            externalTransactionId: paymentResult.transactionId,
          },
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    return NextResponse.json(
      {
        message: "Deposit successful",
        transaction: result.transaction,
        newBalance: result.wallet.balance.toString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing deposit:", error);
    return NextResponse.json(
      { error: "Failed to process deposit" },
      { status: 500 }
    );
  }
}
