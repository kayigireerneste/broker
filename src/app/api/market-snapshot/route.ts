import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/market-snapshot
 * Get historical market data snapshots from RSE syncs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const symbol = searchParams.get("symbol");
    const limit = parseInt(searchParams.get("limit") || "100");

    const snapshots = await prisma.marketSnapshot.findMany({
      where: {
        ...(companyId && { companyId }),
        ...(symbol && { symbol }),
      },
      orderBy: { snapshotDate: "desc" },
      take: Math.min(limit, 1000),
    });

    return NextResponse.json({
      success: true,
      count: snapshots.length,
      snapshots: snapshots.map(s => ({
        ...s,
        closingPrice: s.closingPrice?.toString(),
        previousClosingPrice: s.previousClosingPrice?.toString(),
        tradedVolume: s.tradedVolume?.toString(),
        tradedValue: s.tradedValue?.toString(),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch snapshots", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
