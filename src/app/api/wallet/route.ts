import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/apiAuth";

// GET /api/wallet - Get wallet balance and recent transactions
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: auth.userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: auth.userId,
          balance: 0,
          lockedBalance: 0,
        },
      });
    }

    // Get recent transactions
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const transactions = await prisma.transaction.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const totalTransactions = await prisma.transaction.count({
      where: { userId: auth.userId },
    });

    return NextResponse.json(
      {
        wallet: {
          balance: wallet.balance.toString(),
          lockedBalance: wallet.lockedBalance.toString(),
          availableBalance: wallet.balance.minus(wallet.lockedBalance).toString(),
        },
        transactions: transactions.map((t) => ({
          ...t,
          amount: t.amount.toString(),
        })),
        pagination: {
          total: totalTransactions,
          limit,
          offset,
          hasMore: offset + limit < totalTransactions,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}
