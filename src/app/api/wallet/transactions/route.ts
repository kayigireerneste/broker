import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/wallet/transactions - Get transaction history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type"); // Optional filter
    const status = searchParams.get("status"); // Optional filter
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 401 });
    }

    // Build filter
    const where: {
      userId: string;
      type?: "DEPOSIT" | "WITHDRAW" | "BUY_SHARES" | "SELL_SHARES";
      status?: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
    } = { userId };

    if (type && ["DEPOSIT", "WITHDRAW", "BUY_SHARES", "SELL_SHARES"].includes(type)) {
      where.type = type as "DEPOSIT" | "WITHDRAW" | "BUY_SHARES" | "SELL_SHARES";
    }

    if (status && ["PENDING", "COMPLETED", "FAILED", "CANCELLED"].includes(status)) {
      where.status = status as "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
    }

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Transactions GET error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
