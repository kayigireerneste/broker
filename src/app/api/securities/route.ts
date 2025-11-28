import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";

export interface Security {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  high: number;
  low: number;
  bid: number;
  ask: number;
  previousClose?: number;
  source: "rse" | "database";
  sector?: string;
  marketCap?: string;
  availableShares?: string;
  sharePrice?: number;
  closingPrice?: number;
  priceChange?: number;
}

// Helper to parse numeric values from strings
function parseNumeric(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9+\-.]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

// Calculate percentage change
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Number(((current - previous) / previous * 100).toFixed(2));
}

export async function GET() {
  try {
    const securities: Security[] = [];

    // 1. Fetch from RSE website via market-summary API
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const marketResponse = await axios.get(`${baseUrl}/api/market-summary`, {
        timeout: 5000,
      });

      if (marketResponse.data?.dailySnapshot) {
        for (const item of marketResponse.data.dailySnapshot) {
          const closing = parseNumeric(item.closing);
          const previous = parseNumeric(item.previous);
          const change = parseNumeric(item.change);

          securities.push({
            symbol: item.security,
            name: item.security,
            price: closing,
            change: change || calculateChange(closing, previous),
            volume: item.volume || "0",
            high: closing * 1.02, // Estimated (2% above closing)
            low: closing * 0.98, // Estimated (2% below closing)
            bid: closing - 1, // Estimated
            ask: closing,
            previousClose: previous,
            source: "rse",
          });
        }
      }
    } catch (error) {
      console.warn("Failed to fetch RSE market data:", error);
      // Continue to database companies
    }

    // 2. Fetch from database companies
    const companies = await prisma.company.findMany({
      where: {
        isVerified: true,
        symbol: { not: null },
        sharePrice: { not: null },
      },
      select: {
        symbol: true,
        name: true,
        sharePrice: true,
        closingPrice: true,
        previousClosingPrice: true,
        priceChange: true,
        tradedVolume: true,
        sector: true,
        marketCap: true,
        availableShares: true,
      },
    });

    // 3. Merge database companies with RSE data
    const rseSymbols = new Set(securities.map(s => s.symbol.toUpperCase()));

    for (const company of companies) {
      const symbol = company.symbol!.toUpperCase();
      
      // Check if already exists from RSE
      const existingIndex = securities.findIndex(
        s => s.symbol.toUpperCase() === symbol
      );

      const price = Number(company.sharePrice);
      const closingPrice = company.closingPrice ? Number(company.closingPrice) : price;
      const previousClose = company.previousClosingPrice ? Number(company.previousClosingPrice) : closingPrice;
      const change = company.priceChange 
        ? parseNumeric(company.priceChange)
        : calculateChange(closingPrice, previousClose);

      const security: Security = {
        symbol: company.symbol!,
        name: company.name,
        price: closingPrice,
        change,
        volume: company.tradedVolume ? company.tradedVolume.toString() : "0",
        high: closingPrice * 1.02,
        low: closingPrice * 0.98,
        bid: closingPrice - 1,
        ask: closingPrice,
        previousClose,
        source: "database",
        sector: company.sector || undefined,
        marketCap: company.marketCap ? company.marketCap.toString() : undefined,
        availableShares: company.availableShares ? company.availableShares.toString() : undefined,
        sharePrice: price,
        closingPrice: closingPrice,
        priceChange: change,
      };

      if (existingIndex !== -1) {
        // Update RSE data with database info (database takes priority)
        securities[existingIndex] = {
          ...securities[existingIndex],
          ...security,
          name: company.name, // Use full company name from database
          source: "database", // Mark as database source
        };
      } else {
        // Add new security from database
        securities.push(security);
      }
    }

    // 4. Sort by trading volume (most active first)
    securities.sort((a, b) => {
      const volA = parseNumeric(a.volume);
      const volB = parseNumeric(b.volume);
      return volB - volA;
    });

    return NextResponse.json({ 
      data: securities,
      count: securities.length,
      sources: {
        rse: securities.filter(s => s.source === "rse").length,
        database: securities.filter(s => s.source === "database").length,
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch securities:", error);
    return NextResponse.json(
      { error: "Failed to fetch securities" },
      { status: 500 }
    );
  }
}
