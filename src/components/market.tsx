"use client";

import Image from "next/image";
import { JSX, useEffect, useMemo, useState } from "react";

interface MarketData {
  security: string;
  closing: string;
  previous: string;
  change: string;
  volume: string;
  value: string;
}

interface MarketStatRow {
  indicator: string;
  previous: string;
  current: string;
  change: string;
}

interface MarketHighlightRow {
  indicator: string;
  current: string;
}

interface ExchangeRow {
  country?: string;
  code: string;
  buying: string;
  average: string;
  selling: string;
  flag?: string;
}

interface BondRow {
  no: number;
  tbondNo: string;
  issueDate: string;
  maturityDate: string;
  couponRate: string;
  yieldTM: string;
}

interface MarketSummaryData {
  snapshotDate: string;
  dailySnapshot: MarketData[];
  marketStats: MarketStatRow[];
  highlightStats: MarketHighlightRow[];
  exchangeRates: ExchangeRow[];
  bonds: BondRow[];
  sourceUrl?: string;
  fetchedAt?: string;
}

const TABS = [
  "DAILY MARKET SNAPSHOT",
  "MARKET STATISTICS",
  "EXCHANGE RATE",
  "OUTSTANDING BONDS",
];

const ROWS_PER_PAGE = 10;

export default function MarketSummary(): JSX.Element {
  const [activeTab, setActiveTab] = useState<string>(TABS[0]);
  const [summary, setSummary] = useState<MarketSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState({
    dailySnapshot: 1,
    bonds: 1,
  });

  const marketData = useMemo(() => summary?.dailySnapshot ?? [], [summary?.dailySnapshot]);
  const marketStats = summary?.marketStats ?? [];
  const highlightStats = summary?.highlightStats ?? [];
  const exchangeRates = summary?.exchangeRates ?? [];
  const bonds = useMemo(() => summary?.bonds ?? [], [summary?.bonds]);

  const dailyPage = pages.dailySnapshot;
  const bondPage = pages.bonds;
  const totalDailyPages = Math.max(1, Math.ceil(marketData.length / ROWS_PER_PAGE));
  const totalBondPages = Math.max(1, Math.ceil(bonds.length / ROWS_PER_PAGE));

  const paginatedDaily = useMemo(
    () => marketData.slice((dailyPage - 1) * ROWS_PER_PAGE, dailyPage * ROWS_PER_PAGE),
    [marketData, dailyPage]
  );

  const paginatedBonds = useMemo(
    () => bonds.slice((bondPage - 1) * ROWS_PER_PAGE, bondPage * ROWS_PER_PAGE),
    [bonds, bondPage]
  );

  const updatePage = (dataset: keyof typeof pages, nextPage: number, maxPage: number) => {
    setPages((prev) => {
      const clamped = Math.max(1, Math.min(nextPage, maxPage));
      if (prev[dataset] === clamped) return prev;
      return { ...prev, [dataset]: clamped };
    });
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadMarketSummary = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/market-summary", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as MarketSummaryData;
        const safeData: MarketSummaryData = {
          snapshotDate: data.snapshotDate,
          dailySnapshot: data.dailySnapshot ?? [],
          marketStats: data.marketStats ?? [],
          highlightStats: data.highlightStats ?? [],
          exchangeRates: data.exchangeRates ?? [],
          bonds: data.bonds ?? [],
          sourceUrl: data.sourceUrl,
          fetchedAt: data.fetchedAt,
        };
        setSummary(safeData);
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Failed to fetch market summary", err);
        setError("Live market data is unavailable right now. Please try again later.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadMarketSummary();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const el = document.getElementById("market");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeTab]);

  useEffect(() => {
    setPages((prev) => {
      const dailyTotal = Math.max(1, Math.ceil(marketData.length / ROWS_PER_PAGE));
      const bondTotal = Math.max(1, Math.ceil(bonds.length / ROWS_PER_PAGE));
      const next = {
        dailySnapshot: Math.min(prev.dailySnapshot, dailyTotal),
        bonds: Math.min(prev.bonds, bondTotal),
      };

      if (next.dailySnapshot === prev.dailySnapshot && next.bonds === prev.bonds) {
        return prev;
      }

      return next;
    });
  }, [marketData.length, bonds.length]);

  useEffect(() => {
    setPages((prev) => {
      if (activeTab === "DAILY MARKET SNAPSHOT" && prev.dailySnapshot !== 1) {
        return { ...prev, dailySnapshot: 1 };
      }

      if (activeTab === "OUTSTANDING BONDS" && prev.bonds !== 1) {
        return { ...prev, bonds: 1 };
      }

      return prev;
    });
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-[#f8f9fa] text-gray-600">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mr-2" />
        Loading market data...
      </div>
    );
  }

  return (
    <div id="market" className="min-h-[50vh] bg-[#f8f9fa] py-8 flex flex-col items-center">
      <div className="text-center mb-6 max-w-6xl w-full px-4">
        <h1 className="text-2xl font-bold text-gray-800">MARKET SUMMARY</h1>
        <p className="text-sm text-gray-600 mt-1">As of {summary?.snapshotDate ?? "Unavailable"}</p>
        {summary?.fetchedAt && (
          <p className="text-xs text-gray-500">Last updated {new Date(summary.fetchedAt).toLocaleString()}</p>
        )}

        {error && (
          <div className="mt-4 inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-wrap justify-center mt-5 gap-x-6 gap-y-2 border-b border-gray-200 pb-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-1 text-sm font-semibold transition ${
                activeTab === tab
                  ? "text-[#004B5B] border-b-2 border-[#004B5B]"
                  : "text-gray-600 hover:text-[#004B5B]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="w-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {activeTab === "DAILY MARKET SNAPSHOT" && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Security</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Closing</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Previous</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Change (%)</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Volume</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDaily.map((item, idx) => (
                    <tr
                      key={`${item.security}-${idx}`}
                      className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-[#004B5B]/30 hover:bg-[#004B5B]/5 transition`}
                    >
                      <td className="px-6 py-4 font-semibold text-white bg-[#004B5B] whitespace-nowrap rounded-l-md">
                        {item.security}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{item.closing}</td>
                      <td className="px-6 py-4 text-gray-900">{item.previous}</td>
                      <td
                        className={`px-6 py-4 ${
                          item.change.startsWith("+")
                            ? "text-[#004B5B]"
                          : item.change.startsWith("-")
                          ? "text-red-600"
                          : "text-gray-900"
                        }`}
                      >
                        {item.change}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{item.volume}</td>
                      <td className="px-6 py-4 text-gray-900">{item.value}</td>
                    </tr>
                  ))}
                  {!paginatedDaily.length && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                        No market trades recorded today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalDailyPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => updatePage("dailySnapshot", dailyPage - 1, totalDailyPages)}
                  disabled={dailyPage === 1}
                  className={`px-4 py-2 rounded ${
                    dailyPage === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-linear-to-r from-[#2d94b0] to-[#004f64] text-white"
                  }`}
                >
                  Previous
                </button>

                <div className="text-sm text-gray-700">
                  Page {dailyPage} of {totalDailyPages}
                </div>

                <button
                  onClick={() => updatePage("dailySnapshot", dailyPage + 1, totalDailyPages)}
                  disabled={dailyPage === totalDailyPages}
                  className={`px-4 py-2 rounded ${
                    dailyPage === totalDailyPages
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-linear-to-r from-[#2d94b0] to-[#004f64] text-white"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "MARKET STATISTICS" && (
          <div className="p-6 md:p-8 space-y-8">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Indicators</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Previous</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Current</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {marketStats.map((row) => (
                    <tr key={row.indicator} className="bg-white border-b border-[#004B5B]/20">
                      <td className="px-6 py-4 font-semibold bg-[#02657D]/90 text-white w-56">
                        {row.indicator}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{row.previous}</td>
                      <td className="px-6 py-4 text-gray-900">{row.current}</td>
                      <td className="px-6 py-4 text-[#004B5B]">{row.change}</td>
                    </tr>
                  ))}
                  {!marketStats.length && (
                    <tr>
                      <td colSpan={4} className="px-6 py-6 text-center text-sm text-gray-500">
                        No statistics available at the moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {highlightStats.map((row) => (
                <div key={row.indicator} className="p-5 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#004B5B]">
                    {row.indicator}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-gray-800 wrap-break-word">
                    {row.current}
                  </div>
                </div>
              ))}
              {!highlightStats.length && (
                <div className="col-span-full text-center text-sm text-gray-500">No highlight statistics available.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "EXCHANGE RATE" && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Country</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Code</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Buying Value</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Average Value</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Selling Value</th>
                </tr>
              </thead>
              <tbody>
                {exchangeRates.map((row, idx) => (
                  <tr key={`${row.code}-${idx}`} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-[#004B5B]/20`}>
                    <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {row.flag && (
                          <Image
                            src={row.flag}
                            alt={row.country ?? row.code}
                            width={28}
                            height={20}
                            className="h-5 w-7 rounded-sm object-cover border border-gray-200"
                            unoptimized
                          />
                        )}
                        <span>{row.country ?? ""}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{row.code}</td>
                    <td className="px-6 py-4 text-gray-900">{row.buying}</td>
                    <td className="px-6 py-4 text-gray-900">{row.average}</td>
                    <td className="px-6 py-4 text-gray-900">{row.selling}</td>
                  </tr>
                ))}
                {!exchangeRates.length && (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-500">
                      No exchange rate data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "OUTSTANDING BONDS" && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">No</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">T-Bonds No</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Issue Date</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Maturity Date</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Coupon rate</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Yield TM</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBonds.map((bond) => (
                    <tr key={`${bond.no}-${bond.tbondNo}`} className="bg-white border-b border-[#004B5B]/20">
                      <td className="px-6 py-4 text-gray-800">{bond.no}</td>
                      <td className="px-6 py-4 text-gray-800">{bond.tbondNo}</td>
                      <td className="px-6 py-4 text-gray-800">{bond.issueDate}</td>
                      <td className="px-6 py-4 text-gray-800">{bond.maturityDate}</td>
                      <td className="px-6 py-4 text-gray-800">{bond.couponRate}</td>
                      <td className="px-6 py-4 text-gray-800">{bond.yieldTM}</td>
                    </tr>
                  ))}
                  {!paginatedBonds.length && (
                    <tr>
                      <td colSpan={6} className="px-6 py-6 text-center text-sm text-gray-500">
                        No outstanding bonds listed at this time.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalBondPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => updatePage("bonds", bondPage - 1, totalBondPages)}
                  disabled={bondPage === 1}
                  className={`px-4 py-2 rounded ${
                    bondPage === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-linear-to-r from-[#2d94b0] to-[#004f64] text-white"
                  }`}
                >
                  Previous
                </button>

                <div className="text-sm text-gray-700">
                  Page {bondPage} of {totalBondPages}
                </div>

                <button
                  onClick={() => updatePage("bonds", bondPage + 1, totalBondPages)}
                  disabled={bondPage === totalBondPages}
                  className={`px-4 py-2 rounded ${
                    bondPage === totalBondPages
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-linear-to-r from-[#2d94b0] to-[#004f64] text-white"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
