import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Security symbol mapping from RSE website to database
 * Maps various formats of security names to standardized symbols
 */
const SECURITY_SYMBOL_MAP: Record<string, string> = {
  // BK Group variations
  "BK": "BK",
  "BOK": "BK",
  "BK GROUP": "BK",
  "BK GROUP PLC": "BK",
  
  // Bralirwa variations
  "BLR": "BLR",
  "BRALIRWA": "BLR",
  "BRALIRWA PLC": "BLR",
  
  // Equity Group variations
  "EQTY": "EQTY",
  "EQUITY": "EQTY",
  "EQUITY GROUP": "EQTY",
  "EQUITY GROUP HOLDINGS": "EQTY",
  
  // MTN Rwanda variations
  "MTN": "MTN",
  "MTNR": "MTN",
  "MTN RWANDA": "MTN",
  "MTN RWANDACELL": "MTN",
  
  // KCB Group variations
  "KCB": "KCB",
  "KCB GROUP": "KCB",
  "KCB GROUP PLC": "KCB",
  
  // I&M Bank variations
  "IMR": "IMR",
  "I&M": "IMR",
  "I&M BANK": "IMR",
  "I&M BANK RWANDA": "IMR",
  
  // Crystal Telecom variations
  "CMR": "CMR",
  "CRYSTAL": "CMR",
  "CRYSTAL TELECOM": "CMR",
  
  // Nation Media Group variations
  "NMG": "NMG",
  "NATION": "NMG",
  "NATION MEDIA": "NMG",
  "NATION MEDIA GROUP": "NMG",
  
  // Uchumi variations
  "USL": "USL",
  "UCHUMI": "USL",
  "UCHUMI SUPERMARKETS": "USL",
  
  // Rwanda Housing Bank variations
  "RHB": "RHB",
  "RHUG": "RHB",
  "RWANDA HOUSING": "RHB",
};

/**
 * Normalize security name to a standard symbol
 */
function normalizeSecuritySymbol(security: string): string | null {
  const normalized = security.toUpperCase().trim();
  
  // Direct match
  if (SECURITY_SYMBOL_MAP[normalized]) {
    return SECURITY_SYMBOL_MAP[normalized];
  }
  
  // Try to find partial match
  for (const [key, value] of Object.entries(SECURITY_SYMBOL_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  // If no match found, return the first word as potential symbol
  const firstWord = normalized.split(/\s+/)[0];
  if (firstWord && firstWord.length <= 5) {
    return firstWord;
  }
  
  return null;
}

/**
 * Parse price string to Decimal
 * Handles formats like "245.50", "1,234.56", "N/A", etc.
 */
function parsePrice(priceStr: string): Decimal | null {
  if (!priceStr || priceStr === "N/A" || priceStr === "-" || priceStr === "—") {
    return null;
  }
  
  // Remove commas and any currency symbols
  const cleaned = priceStr.replace(/[,\s]/g, "").replace(/[^\d.-]/g, "");
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed) || !isFinite(parsed)) {
    return null;
  }
  
  return new Decimal(parsed);
}

/**
 * Parse volume/value string to Decimal
 */
function parseVolume(volumeStr: string): Decimal | null {
  if (!volumeStr || volumeStr === "N/A" || volumeStr === "-" || volumeStr === "—") {
    return null;
  }
  
  // Remove commas and any non-numeric characters except decimal point
  const cleaned = volumeStr.replace(/[,\s]/g, "").replace(/[^\d.-]/g, "");
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed) || !isFinite(parsed)) {
    return null;
  }
  
  return new Decimal(parsed);
}

/**
 * Parse change string to extract numeric value
 * Handles formats like "+2.5%", "-1.23", "0.00", etc.
 */
function parseChange(changeStr: string): string {
  if (!changeStr || changeStr === "N/A" || changeStr === "-" || changeStr === "—") {
    return "0.00";
  }
  
  // Extract numeric value including sign
  const match = changeStr.match(/([+-]?\d+\.?\d*)/);
  if (match) {
    return match[1];
  }
  
  return "0.00";
}

export interface DailySnapshotData {
  security: string;
  closing: string;
  previous: string;
  change: string;
  volume: string;
  value: string;
}

export interface MarketSyncResult {
  success: boolean;
  synced: number;
  skipped: number;
  errors: string[];
  details: Array<{
    security: string;
    symbol: string | null;
    status: "synced" | "skipped" | "error";
    message?: string;
  }>;
}

/**
 * Sync market data from RSE to database
 * Updates existing companies with latest market data
 */
export async function syncMarketDataToDatabase(
  dailySnapshot: DailySnapshotData[],
  snapshotDate: string
): Promise<MarketSyncResult> {
  const result: MarketSyncResult = {
    success: true,
    synced: 0,
    skipped: 0,
    errors: [],
    details: [],
  };

  // Parse snapshot date
  let parsedSnapshotDate: Date;
  try {
    // Try to parse various date formats
    const dateStr = snapshotDate.replace(/\s+/g, " ").trim();
    parsedSnapshotDate = new Date(dateStr);
    if (isNaN(parsedSnapshotDate.getTime())) {
      parsedSnapshotDate = new Date();
    }
  } catch {
    parsedSnapshotDate = new Date();
  }

  for (const snapshot of dailySnapshot) {
    const symbol = normalizeSecuritySymbol(snapshot.security);
    
    if (!symbol) {
      result.skipped++;
      result.details.push({
        security: snapshot.security,
        symbol: null,
        status: "skipped",
        message: "Could not determine symbol from security name",
      });
      continue;
    }

    try {
      // Find company by symbol
      const company = await prisma.company.findFirst({
        where: {
          OR: [
            { symbol: symbol },
            { symbol: symbol.toUpperCase() },
            { name: { contains: symbol } },
          ],
        },
      });

      if (!company) {
        result.skipped++;
        result.details.push({
          security: snapshot.security,
          symbol,
          status: "skipped",
          message: `No company found with symbol: ${symbol}`,
        });
        continue;
      }

      // Parse market data
      const closingPrice = parsePrice(snapshot.closing);
      const previousClosingPrice = parsePrice(snapshot.previous);
      const priceChange = parseChange(snapshot.change);
      const tradedVolume = parseVolume(snapshot.volume);
      const tradedValue = parseVolume(snapshot.value);

      // Update company with market data
      await prisma.company.update({
        where: { id: company.id },
        data: {
          closingPrice: closingPrice ?? company.closingPrice,
          previousClosingPrice: previousClosingPrice ?? company.previousClosingPrice,
          priceChange: priceChange,
          tradedVolume: tradedVolume ?? company.tradedVolume,
          tradedValue: tradedValue ?? company.tradedValue,
          snapshotDate: parsedSnapshotDate,
          // Also update sharePrice if closingPrice is available
          ...(closingPrice && { sharePrice: closingPrice }),
        },
      });

      // Save historical snapshot
      await prisma.marketSnapshot.create({
        data: {
          companyId: company.id,
          security: snapshot.security,
          symbol: symbol,
          closingPrice: closingPrice,
          previousClosingPrice: previousClosingPrice,
          priceChange: priceChange,
          tradedVolume: tradedVolume,
          tradedValue: tradedValue,
          snapshotDate: parsedSnapshotDate,
        },
      });

      result.synced++;
      result.details.push({
        security: snapshot.security,
        symbol,
        status: "synced",
        message: `Updated ${company.name} with closing price: ${closingPrice?.toString() ?? "N/A"}`,
      });

    } catch (error) {
      result.errors.push(
        `Error syncing ${snapshot.security}: ${error instanceof Error ? error.message : String(error)}`
      );
      result.details.push({
        security: snapshot.security,
        symbol,
        status: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  result.success = result.errors.length === 0;
  return result;
}

/**
 * Create or update companies from market data
 * This is useful for initial setup or when new securities are listed
 */
export async function upsertCompaniesFromMarketData(
  dailySnapshot: DailySnapshotData[],
  snapshotDate: string
): Promise<MarketSyncResult> {
  const result: MarketSyncResult = {
    success: true,
    synced: 0,
    skipped: 0,
    errors: [],
    details: [],
  };

  // Parse snapshot date
  let parsedSnapshotDate: Date;
  try {
    const dateStr = snapshotDate.replace(/\s+/g, " ").trim();
    parsedSnapshotDate = new Date(dateStr);
    if (isNaN(parsedSnapshotDate.getTime())) {
      parsedSnapshotDate = new Date();
    }
  } catch {
    parsedSnapshotDate = new Date();
  }

  for (const snapshot of dailySnapshot) {
    const symbol = normalizeSecuritySymbol(snapshot.security);
    
    if (!symbol) {
      result.skipped++;
      result.details.push({
        security: snapshot.security,
        symbol: null,
        status: "skipped",
        message: "Could not determine symbol from security name",
      });
      continue;
    }

    try {
      // Parse market data
      const closingPrice = parsePrice(snapshot.closing);
      const previousClosingPrice = parsePrice(snapshot.previous);
      const priceChange = parseChange(snapshot.change);
      const tradedVolume = parseVolume(snapshot.volume);
      const tradedValue = parseVolume(snapshot.value);

      // Check if company exists
      const existingCompany = await prisma.company.findFirst({
        where: {
          OR: [
            { symbol: symbol },
            { symbol: symbol.toUpperCase() },
          ],
        },
      });

      if (existingCompany) {
        // Update existing company
        await prisma.company.update({
          where: { id: existingCompany.id },
          data: {
            closingPrice: closingPrice ?? existingCompany.closingPrice,
            previousClosingPrice: previousClosingPrice ?? existingCompany.previousClosingPrice,
            priceChange: priceChange,
            tradedVolume: tradedVolume ?? existingCompany.tradedVolume,
            tradedValue: tradedValue ?? existingCompany.tradedValue,
            snapshotDate: parsedSnapshotDate,
            ...(closingPrice && { sharePrice: closingPrice }),
          },
        });

        result.synced++;
        result.details.push({
          security: snapshot.security,
          symbol,
          status: "synced",
          message: `Updated existing company: ${existingCompany.name}`,
        });
      } else {
        // Skip creating new companies - they should be created through proper registration
        result.skipped++;
        result.details.push({
          security: snapshot.security,
          symbol,
          status: "skipped",
          message: `Company with symbol ${symbol} not found in database. Register company first.`,
        });
      }

    } catch (error) {
      result.errors.push(
        `Error processing ${snapshot.security}: ${error instanceof Error ? error.message : String(error)}`
      );
      result.details.push({
        security: snapshot.security,
        symbol,
        status: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  result.success = result.errors.length === 0;
  return result;
}

/**
 * Get the last sync timestamp from the database
 */
export async function getLastSyncTimestamp(): Promise<Date | null> {
  const company = await prisma.company.findFirst({
    where: {
      snapshotDate: { not: null },
    },
    orderBy: {
      snapshotDate: "desc",
    },
    select: {
      snapshotDate: true,
    },
  });

  return company?.snapshotDate ?? null;
}

/**
 * Check if sync is needed based on last sync time
 * Returns true if last sync was more than the specified minutes ago
 */
export async function isSyncNeeded(minutesThreshold: number = 5): Promise<boolean> {
  const lastSync = await getLastSyncTimestamp();
  
  if (!lastSync) {
    return true;
  }

  const now = new Date();
  const diffMs = now.getTime() - lastSync.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes >= minutesThreshold;
}