import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";
import { 
  syncMarketDataToDatabase, 
  isSyncNeeded,
  getLastSyncTimestamp,
  type DailySnapshotData 
} from "@/lib/marketDataSync";

const MARKET_URLS = [
  "https://rse.rw/",
  "https://www.rse.rw/market-data/market-summary",
];

// HTTPS agent to bypass SSL certificate verification for scraping
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const normaliseText = (value: string) => value.replace(/\s+/g, " ").trim();

const parseDailySnapshot = ($: cheerio.Root): DailySnapshotData[] => {
  const rows: DailySnapshotData[] = [];
  $("#tab-1 table tbody tr").each((_, element) => {
    const cells = $(element).find("td");
    if (cells.length < 6) return;

    rows.push({
      security: normaliseText($(cells[0]).text()),
      closing: normaliseText($(cells[1]).text()),
      previous: normaliseText($(cells[2]).text()),
      change: normaliseText($(cells[3]).text()),
      volume: normaliseText($(cells[4]).text()),
      value: normaliseText($(cells[5]).text()),
    });
  });
  return rows;
};

interface FetchResult {
  snapshotDate: string;
  dailySnapshot: DailySnapshotData[];
  sourceUrl: string;
}

const fetchMarketData = async (): Promise<FetchResult> => {
  let lastError: unknown = null;

  for (const url of MARKET_URLS) {
    try {
      console.log(`[Market Sync] Attempting to fetch market data from: ${url}`);
      const response = await axios.get(url, {
        timeout: 15000,
        httpsAgent,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      console.log(`[Market Sync] Successfully fetched data from: ${url}`);
      const $ = cheerio.load(response.data);

      const snapshotDate =
        normaliseText($("#tabs #date").text()) || new Date().toLocaleDateString();
      const dailySnapshot = parseDailySnapshot($);

      return {
        snapshotDate,
        dailySnapshot,
        sourceUrl: url,
      };
    } catch (error) {
      console.error(
        `[Market Sync] Failed to fetch from ${url}:`,
        error instanceof Error ? error.message : error
      );
      lastError = error;
    }
  }

  throw lastError ?? new Error("Unable to fetch market data from any known source");
};

/**
 * POST /api/market-sync
 * Manually trigger market data sync from RSE to database
 * 
 * Query params:
 * - force: boolean - Force sync even if recently synced (default: false)
 * 
 * Headers:
 * - x-api-key: string - Optional API key for cron job authentication
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    // Optional: Add API key authentication for cron jobs
    const apiKey = request.headers.get("x-api-key");
    const expectedApiKey = process.env.MARKET_SYNC_API_KEY;
    
    // If API key is configured, validate it
    if (expectedApiKey && apiKey !== expectedApiKey) {
      // Allow requests without API key from localhost/internal
      const host = request.headers.get("host") || "";
      const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
      
      if (!isLocalhost && !apiKey) {
        return NextResponse.json(
          { error: "API key required for external requests" },
          { status: 401 }
        );
      }
      
      if (apiKey && apiKey !== expectedApiKey) {
        return NextResponse.json(
          { error: "Invalid API key" },
          { status: 401 }
        );
      }
    }

    // Check if sync is needed (unless forced)
    if (!force) {
      const syncNeeded = await isSyncNeeded(1); // 1 minute threshold
      if (!syncNeeded) {
        const lastSync = await getLastSyncTimestamp();
        return NextResponse.json({
          success: true,
          message: "Sync not needed - data is recent",
          lastSync: lastSync?.toISOString(),
          skipped: true,
        });
      }
    }

    // Fetch market data from RSE
    console.log("[Market Sync] Starting market data fetch...");
    const marketData = await fetchMarketData();
    
    if (!marketData.dailySnapshot.length) {
      return NextResponse.json({
        success: false,
        error: "No market data found in RSE response",
        sourceUrl: marketData.sourceUrl,
      }, { status: 502 });
    }

    console.log(`[Market Sync] Found ${marketData.dailySnapshot.length} securities, syncing to database...`);

    // Sync to database
    const syncResult = await syncMarketDataToDatabase(
      marketData.dailySnapshot,
      marketData.snapshotDate
    );

    console.log(`[Market Sync] Sync complete: ${syncResult.synced} synced, ${syncResult.skipped} skipped, ${syncResult.errors.length} errors`);

    return NextResponse.json({
      success: syncResult.success,
      message: syncResult.success 
        ? `Successfully synced ${syncResult.synced} securities` 
        : `Sync completed with ${syncResult.errors.length} errors`,
      snapshotDate: marketData.snapshotDate,
      sourceUrl: marketData.sourceUrl,
      stats: {
        total: marketData.dailySnapshot.length,
        synced: syncResult.synced,
        skipped: syncResult.skipped,
        errors: syncResult.errors.length,
      },
      details: syncResult.details,
      errors: syncResult.errors.length > 0 ? syncResult.errors : undefined,
    });

  } catch (error) {
    console.error("[Market Sync] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to sync market data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/market-sync
 * Get sync status and last sync timestamp
 */
export async function GET() {
  try {
    const lastSync = await getLastSyncTimestamp();
    const syncNeeded = await isSyncNeeded(1);

    return NextResponse.json({
      lastSync: lastSync?.toISOString() ?? null,
      syncNeeded,
      nextSyncRecommended: syncNeeded 
        ? "Now" 
        : lastSync 
          ? new Date(lastSync.getTime() + 5 * 60 * 1000).toISOString()
          : "Now",
    });
  } catch (error) {
    console.error("[Market Sync] Status check error:", error);
    return NextResponse.json(
      {
        error: "Failed to check sync status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}