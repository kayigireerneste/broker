import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
const depositSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["card", "mobile", "bank"]),
  reference: z.string().optional(),
});

const withdrawSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["card", "mobile", "bank"]),
  bankDetails: z
    .object({
      bankName: z.string().optional(),
      accountNumber: z.string().optional(),
    })
    .optional(),
});

// GET /api/wallet - Get wallet balance and info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 401 });
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          lockedBalance: 0,
        },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      });
    }

    // Get recent transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      wallet: {
        balance: wallet.balance,
        lockedBalance: wallet.lockedBalance,
        availableBalance: Number(wallet.balance) - Number(wallet.lockedBalance),
      },
      user: wallet.user,
      recentTransactions: transactions,
    });
  } catch (error) {
    console.error("Wallet GET error:", error);
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}

// POST /api/wallet - Deposit or withdraw funds
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, amount, paymentMethod, reference, bankDetails } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 401 });
    }

    if (!action || !["deposit", "withdraw"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Validate based on action
    if (action === "deposit") {
      const validation = depositSchema.safeParse({ amount, paymentMethod, reference });
      if (!validation.success) {
        return NextResponse.json(
          { error: "Validation failed", details: validation.error.issues },
          { status: 400 }
        );
      }
    } else {
      const validation = withdrawSchema.safeParse({ amount, paymentMethod, bankDetails });
      if (!validation.success) {
        return NextResponse.json(
          { error: "Validation failed", details: validation.error.issues },
          { status: 400 }
        );
      }
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          lockedBalance: 0,
        },
      });
    }

    // Check balance for withdrawals
    if (action === "withdraw") {
      const availableBalance = Number(wallet.balance) - Number(wallet.lockedBalance);
      if (availableBalance < amount) {
        return NextResponse.json(
          { error: "Insufficient balance", availableBalance },
          { status: 400 }
        );
      }
    }

    // Create transaction and update wallet in a transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: action === "deposit" ? "DEPOSIT" : "WITHDRAW",
          amount,
          status: "COMPLETED", // In production, this would start as PENDING
          paymentMethod,
          reference: reference || `TXN-${Date.now()}`,
          description: `${action === "deposit" ? "Deposit" : "Withdrawal"} via ${paymentMethod}`,
          metadata: bankDetails ? { bankDetails } : undefined,
        },
      });

      // Update wallet balance
      const newBalance =
        action === "deposit"
          ? Number(wallet!.balance) + amount
          : Number(wallet!.balance) - amount;

      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: {
          balance: newBalance,
        },
      });

      return { transaction, wallet: updatedWallet };
    });

    return NextResponse.json({
      success: true,
      message: `${action === "deposit" ? "Deposit" : "Withdrawal"} successful`,
      transaction: result.transaction,
      wallet: {
        balance: result.wallet.balance,
        lockedBalance: result.wallet.lockedBalance,
        availableBalance: Number(result.wallet.balance) - Number(result.wallet.lockedBalance),
      },
    });
  } catch (error) {
    console.error("Wallet POST error:", error);
    return NextResponse.json({ error: "Failed to process transaction" }, { status: 500 });
  }
}
