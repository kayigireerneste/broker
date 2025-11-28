import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/portfolio - Get user's portfolio with current values
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 401 });
    }

    // Get all portfolio entries with company details
    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            sector: true,
            sharePrice: true,
            closingPrice: true,
            previousClosingPrice: true,
            priceChange: true,
          },
        },
      },
      orderBy: { totalInvested: "desc" },
    });

    // Calculate current values and P&L
    const portfolioWithMetrics = portfolios.map((portfolio) => {
      const currentPrice = Number(portfolio.company.closingPrice || portfolio.company.sharePrice || 0);
      const currentValue = currentPrice * portfolio.quantity;
      const totalInvested = Number(portfolio.totalInvested);
      const profitLoss = currentValue - totalInvested;
      const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
      const priceChange = portfolio.company.priceChange || "0.00";

      return {
        id: portfolio.id,
        companyId: portfolio.company.id,
        companyName: portfolio.company.name,
        sector: portfolio.company.sector,
        quantity: portfolio.quantity,
        averageBuyPrice: Number(portfolio.averageBuyPrice),
        currentPrice,
        totalInvested,
        currentValue,
        profitLoss,
        profitLossPercentage,
        priceChange,
        createdAt: portfolio.createdAt,
        updatedAt: portfolio.updatedAt,
      };
    });

    // Calculate summary statistics
    const totalInvested = portfolioWithMetrics.reduce((sum, p) => sum + p.totalInvested, 0);
    const totalCurrentValue = portfolioWithMetrics.reduce((sum, p) => sum + p.currentValue, 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalProfitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    // Calculate sector allocation
    const sectorAllocation = portfolioWithMetrics.reduce((acc, p) => {
      const sector = p.sector || "Unknown";
      if (!acc[sector]) {
        acc[sector] = {
          sector,
          value: 0,
          percentage: 0,
        };
      }
      acc[sector].value += p.currentValue;
      return acc;
    }, {} as Record<string, { sector: string; value: number; percentage: number }>);

    // Calculate percentages for sector allocation
    Object.values(sectorAllocation).forEach((allocation) => {
      allocation.percentage = totalCurrentValue > 0 ? (allocation.value / totalCurrentValue) * 100 : 0;
    });

    return NextResponse.json({
      portfolio: portfolioWithMetrics,
      summary: {
        totalInvested,
        totalCurrentValue,
        totalProfitLoss,
        totalProfitLossPercentage,
        totalHoldings: portfolios.length,
      },
      sectorAllocation: Object.values(sectorAllocation),
    });
  } catch (error) {
    console.error("Portfolio GET error:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}
