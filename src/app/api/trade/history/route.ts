import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/apiAuth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authResult.userId || authResult.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");

    const trades = await prisma.trade.findMany({
      where: { userId },
      include: {
        company: {
          select: {
            name: true,
            symbol: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ trades });
  } catch (error) {
    console.error("Error fetching trade history:", error);
    return NextResponse.json(
      { error: "Failed to fetch trade history" },
      { status: 500 }
    );
  }
}
