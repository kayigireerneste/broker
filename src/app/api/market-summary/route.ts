import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

const MARKET_URLS = [
	"https://rse.rw/",
	"https://www.rse.rw/market-data/market-summary",
];
const CACHE_TTL_MS = 1 * 60 * 1000; // 1 minute cache for real-time updates

// HTTPS agent to bypass SSL certificate verification for scraping
const httpsAgent = new https.Agent({
	rejectUnauthorized: false,
});

interface CachedPayload {
	data: MarketSummaryPayload;
	expiry: number;
}

type MarketStatusValue = "open" | "closed" | "suspended" | "unknown";

interface MarketSummaryPayload {
	snapshotDate: string;
	dailySnapshot: Array<{
		security: string;
		closing: string;
		previous: string;
		change: string;
		volume: string;
		value: string;
	}>;
	marketStats: Array<{
		indicator: string;
		previous: string;
		current: string;
		change: string;
	}>;
	highlightStats: Array<{
		indicator: string;
		current: string;
	}>;
	exchangeRates: Array<{
		country?: string;
		code: string;
		buying: string;
		average: string;
		selling: string;
		flag?: string;
	}>;
	bonds: Array<{
		no: number;
		tbondNo: string;
		issueDate: string;
		maturityDate: string;
		couponRate: string;
		yieldTM: string;
	}>;
	marketStatus?: {
		label: string;
		normalized: MarketStatusValue;
		isOpen: boolean;
	};
	sourceUrl: string;
	fetchedAt: string;
}

let cache: CachedPayload | null = null;

const normaliseText = (value: string) => value.replace(/\s+/g, " ").trim();

const parseDailySnapshot = ($: cheerio.Root) => {
	const rows: MarketSummaryPayload["dailySnapshot"] = [];
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

const parseMarketStats = ($: cheerio.Root) => {
	const stats: MarketSummaryPayload["marketStats"] = [];
	const table = $("#tab-2 table").first();
	if (!table.length) return stats;

	table.find("tbody tr").each((_, element) => {
		const cells = $(element).find("td");
		if (cells.length < 4) return;
		stats.push({
			indicator: normaliseText($(cells[0]).text()),
			previous: normaliseText($(cells[1]).text()),
			current: normaliseText($(cells[2]).text()),
			change: normaliseText($(cells[3]).text()),
		});
	});

	return stats;
};

const parseHighlightStats = ($: cheerio.Root) => {
	const highlights: MarketSummaryPayload["highlightStats"] = [];
	const table = $("#tab-2 table").eq(1);
	if (!table.length) return highlights;

	table.find("tbody tr").each((_, element) => {
		const cells = $(element).find("td");
		if (cells.length < 2) return;
		highlights.push({
			indicator: normaliseText($(cells[0]).text()),
			current: normaliseText($(cells[1]).text()),
		});
	});

	return highlights;
};

const classifyMarketStatus = (raw: string): MarketSummaryPayload["marketStatus"] => {
	const label = normaliseText(raw).replace(/^[:\-\s]+/u, "");
	const lower = label.toLowerCase();
	let normalized: MarketStatusValue = "unknown";

	// Check for closed first (more specific patterns)
	if (/close|closed|after\s*hours|post-?close|end of day|market\s*close/u.test(lower)) {
		normalized = "closed";
	} else if (/suspend|halt|holiday|maintenance/u.test(lower)) {
		normalized = "suspended";
	} else if (/open|trading|pre-?open|session|market\s*open/u.test(lower)) {
		normalized = "open";
	}

	return {
		label: label || "Unknown",
		normalized,
		isOpen: normalized === "open",
	};
};

const extractMarketStatus = (
	$: cheerio.Root,
	highlightStats: MarketSummaryPayload["highlightStats"]
): MarketSummaryPayload["marketStatus"] | undefined => {
	// Priority 1: Check highlight stats table
	const highlightEntry = highlightStats.find((item) => /market status/i.test(item.indicator));
	if (highlightEntry?.current) {
		return classifyMarketStatus(highlightEntry.current);
	}

	// Priority 2: Check for visible market status spans (RSE has both open/closed spans)
	// The one with red background (#f11616) is the active status
	let closedSpan: string | undefined;
	let openSpan: string | undefined;
	
	$("span.market-status, .market-status").each((_, element) => {
		const $el = $(element);
		const style = $el.attr("style") || "";
		const id = $el.attr("id") || "";
		const text = normaliseText($el.text());
		
		if (!text) return;
		
		// Check if this span has red background (indicates active closed status)
		if (/background.*#f11616|background.*red/i.test(style)) {
			closedSpan = text;
		} else if (id === "open") {
			openSpan = text;
		}
	});
	
	// If closed span has red background, market is closed
	if (closedSpan) {
		return classifyMarketStatus(closedSpan);
	}
	
	// Otherwise use open span
	if (openSpan) {
		return classifyMarketStatus(openSpan);
	}

	// Priority 3: Search in marquee or ticker elements
	let marqueeStatus: string | undefined;
	$("marquee, .ticker, .status-bar").each((_, element) => {
		const text = normaliseText($(element).text());
		const match = text.match(/market status\s*[:\-]?\s*([a-z\s]+)/iu);
		if (match?.[1]) {
			marqueeStatus = match[1];
			return false;
		}
	});
	if (marqueeStatus) {
		return classifyMarketStatus(marqueeStatus);
	}

	return undefined;
};

const parseExchangeRates = ($: cheerio.Root, baseUrl: string) => {
	const rows: MarketSummaryPayload["exchangeRates"] = [];
	$("#tab-4 table tbody tr").each((_, element) => {
		const cells = $(element).find("td");
		if (cells.length < 5) return;

		const countryCell = $(cells[0]);
		const countryImg = countryCell.find("img");
		const countryAttr = normaliseText(countryImg.attr("alt") ?? countryImg.attr("title") ?? "");
		const imgSrc = countryImg.attr("src") ?? "";
		let flag: string | undefined;
		if (imgSrc) {
			try {
				flag = new URL(imgSrc, baseUrl).toString();
			} catch {
				flag = imgSrc;
			}
		}
		const countryText = normaliseText(countryCell.text());
		const code = normaliseText($(cells[1]).text());

		rows.push({
			country: countryAttr || countryText || undefined,
			code,
			buying: normaliseText($(cells[2]).text()),
			average: normaliseText($(cells[3]).text()),
			selling: normaliseText($(cells[4]).text()),
			flag,
		});
	});

	return rows;
};

const parseBonds = ($: cheerio.Root) => {
	const rows: MarketSummaryPayload["bonds"] = [];
	$("#tab-5 table tbody tr").each((_, element) => {
		const cells = $(element).find("td");
		if (cells.length < 6) return;

		const firstCell = normaliseText($(cells[0]).text());
		const rowNumber = Number.parseInt(firstCell, 10);
		if (Number.isNaN(rowNumber)) return;

		rows.push({
			no: rowNumber,
			tbondNo: normaliseText($(cells[1]).text()),
			issueDate: normaliseText($(cells[2]).text()),
			maturityDate: normaliseText($(cells[3]).text()),
			couponRate: normaliseText($(cells[4]).text()),
			yieldTM: normaliseText($(cells[5]).text()),
		});
	});

	return rows;
};

const fetchMarketSummary = async (): Promise<MarketSummaryPayload> => {
	let lastError: unknown = null;

	for (const url of MARKET_URLS) {
		try {
			console.log(`Attempting to fetch market data from: ${url}`);
			const response = await axios.get(url, { 
				timeout: 15000,
				httpsAgent,
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
				}
			});
			console.log(`Successfully fetched data from: ${url}`);
			const $ = cheerio.load(response.data);

			const snapshotDate =
				normaliseText($("#tabs #date").text()) || new Date().toLocaleDateString();
			const dailySnapshot = parseDailySnapshot($);
			const marketStats = parseMarketStats($);
			const highlightStats = parseHighlightStats($);
			const marketStatus = extractMarketStatus($, highlightStats);

			return {
				snapshotDate,
				dailySnapshot,
				marketStats,
				highlightStats,
				exchangeRates: parseExchangeRates($, url),
				bonds: parseBonds($),
				marketStatus,
				sourceUrl: url,
				fetchedAt: new Date().toISOString(),
			};
		} catch (error) {
			console.error(`Failed to fetch from ${url}:`, error instanceof Error ? error.message : error);
			lastError = error;
		}
	}

	throw lastError ?? new Error("Unable to fetch market summary from any known source");
};

export async function GET() {
	try {
		const now = Date.now();
		if (cache && cache.expiry > now) {
			return NextResponse.json(cache.data, { headers: { "x-cache": "HIT" } });
		}

		const data = await fetchMarketSummary();
		cache = {
			data,
			expiry: now + CACHE_TTL_MS,
		};

		return NextResponse.json(data, { headers: { "x-cache": "MISS" } });
	} catch (error) {
		console.error("FAILED_TO_FETCH_MARKET_SUMMARY", error);

		if (cache) {
			return NextResponse.json(cache.data, {
				headers: {
					"x-cache": "STALE",
				},
			});
		}

		return NextResponse.json(
			{ error: "Unable to fetch market summary" },
			{ status: 502 }
		);
	}
}
