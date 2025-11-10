"use client";

import Link from "next/link";
import type { JSX } from "react";
import { useMemo, useState } from "react";
import { FiActivity, FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { useMarketSummary } from "@/hooks/useMarketSummary";

type SortKey = "change" | "volume" | "value" | "closing";

type Accent = {
  bg: string;
  border: string;
  badge: string;
  badgeText: string;
  highlight: string;
};

const ACCENTS: Accent[] = [
  {
    bg: "from-sky-400/10 via-sky-500/5 to-blue-500/10",
    border: "border-sky-500/40",
    badge: "bg-sky-500/15",
    badgeText: "text-sky-500",
    highlight: "text-sky-500",
  },
  {
    bg: "from-emerald-400/10 via-green-500/5 to-emerald-500/10",
    border: "border-emerald-500/40",
    badge: "bg-emerald-500/15",
    badgeText: "text-emerald-500",
    highlight: "text-emerald-500",
  },
  {
    bg: "from-purple-500/10 via-indigo-500/5 to-purple-500/10",
    border: "border-purple-500/40",
    badge: "bg-purple-500/15",
    badgeText: "text-purple-500",
    highlight: "text-purple-400",
  },
  {
    bg: "from-amber-400/10 via-orange-400/5 to-amber-400/10",
    border: "border-amber-500/40",
    badge: "bg-amber-500/15",
    badgeText: "text-amber-500",
    highlight: "text-amber-500",
  },
];

function parseNumeric(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9+\-.]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function MarketCardGrid(): JSX.Element {
  const { data, loading, error } = useMarketSummary();
  const [sortKey, setSortKey] = useState<SortKey>("change");

  const snapshot = useMemo(() => data?.dailySnapshot ?? [], [data?.dailySnapshot]);

  const enriched = useMemo(() => {
    return snapshot.map((row, idx) => {
      const changeValue = parseNumeric(row.change);
      const closingValue = parseNumeric(row.closing);
      const volumeValue = parseNumeric(row.volume);
      const valueValue = parseNumeric(row.value);
      const positive = changeValue > 0;
      const negative = changeValue < 0;

      return {
        ...row,
        index: idx,
        changeValue,
        closingValue,
        volumeValue,
        valueValue,
        positive,
        negative,
        tone: ACCENTS[idx % ACCENTS.length],
      };
    });
  }, [snapshot]);

  const sortedCards = useMemo(() => {
    const cards = [...enriched];
    cards.sort((a, b) => {
      switch (sortKey) {
        case "volume":
          return b.volumeValue - a.volumeValue;
        case "value":
          return b.valueValue - a.valueValue;
        case "closing":
          return b.closingValue - a.closingValue;
        case "change":
        default:
          return b.changeValue - a.changeValue;
      }
    });
    return cards;
  }, [enriched, sortKey]);

  const hasSnapshot = sortedCards.length > 0;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
        <div className="space-y-2">
          <p className="text-sm tracking-wide text-[#2d94b0] uppercase font-semibold">
            Daily market momentum
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Explore live securities and trade opportunities
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
            We reimagined the daily snapshot from the exchange into actionable trading cards. Monitor the last
            close, intraday swings, and liquidity signals, then act instantly with Buy or Sell CTA buttons.
          </p>
          {data?.snapshotDate && (
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <FiActivity className="h-4 w-4" />
              Updated {data.snapshotDate}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase">Sort by</span>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="bg-transparent border-none text-sm font-semibold text-slate-800 focus:outline-none"
            >
              <option value="change">Change % (desc)</option>
              <option value="volume">Volume (desc)</option>
              <option value="value">Value (desc)</option>
              <option value="closing">Closing price (desc)</option>
            </select>
          </div>
          {/* Placeholder view toggle for future extension */}
          <div className="flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-2 text-xs uppercase text-white tracking-wider">
            <span className="font-semibold">Grid view</span>
          </div>
        </div>
      </header>

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-200 bg-white/70 p-6 animate-pulse min-h-[280px]"
            >
              <div className="h-4 w-24 bg-slate-200 rounded-full mb-4" />
              <div className="h-8 w-32 bg-slate-200 rounded-lg mb-6" />
              <div className="space-y-3">
                <div className="h-3 w-full bg-slate-200 rounded-full" />
                <div className="h-3 w-3/4 bg-slate-200 rounded-full" />
                <div className="h-3 w-2/3 bg-slate-200 rounded-full" />
              </div>
              <div className="mt-8 flex gap-3">
                <div className="h-10 flex-1 bg-slate-200 rounded-full" />
                <div className="h-10 flex-1 bg-slate-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/80 px-6 py-8 text-rose-600 text-center">
          <p className="font-semibold">{error}</p>
          <p className="text-sm text-rose-500 mt-2">
            Please refresh the page to attempt another fetch from the exchange.
          </p>
        </div>
      )}

      {!loading && !error && !hasSnapshot && (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          There are no securities in today&apos;s snapshot yet. Check back soon for live opportunities.
        </div>
      )}

      {hasSnapshot && (
        <div className="grid gap-6 md:gap-7 lg:gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {sortedCards.map((card) => {
            const trendIcon = card.positive ? FiTrendingUp : card.negative ? FiTrendingDown : FiActivity;
            const TrendIcon = trendIcon;
            const changeTone = card.positive
              ? "text-emerald-500 bg-emerald-500/10"
              : card.negative
              ? "text-rose-500 bg-rose-500/10"
              : "text-slate-500 bg-slate-200/50";

            return (
              <article
                key={`${card.security}-${card.index}`}
                className={`relative overflow-hidden rounded-3xl border backdrop-blur-md bg-linear-to-br ${card.tone.bg} ${card.tone.border} p-6 sm:p-7 flex flex-col gap-6 shadow-[0_25px_45px_-20px_rgba(15,23,42,0.25)] transition hover:-translate-y-1 hover:shadow-[0_35px_55px_-25px_rgba(15,23,42,0.35)]`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-3">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${card.tone.badge} ${card.tone.badgeText}`}>
                      <TrendIcon className="h-4 w-4" />
                      {card.positive ? "Bullish" : card.negative ? "Bearish" : "Sideways"}
                    </span>
                    <h2 className="text-xl font-semibold text-slate-900 leading-tight">
                      {card.security || "Unnamed Security"}
                    </h2>
                    <p className="text-sm text-slate-600 max-w-88">
                      Quick pulse on liquidity and price action so you can decide whether to buy the dip or secure gains.
                    </p>
                  </div>
                  <div className="relative h-16 w-16 rounded-2xl bg-slate-900/5 flex items-center justify-center border border-white/40 shadow-inner">
                    <span className={`${card.tone.highlight} text-lg font-bold`}>{card.closing || "—"}</span>
                  </div>
                </div>

                <dl className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                  <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-sm px-4 py-3 shadow-sm">
                    <dt className="text-xs uppercase tracking-wider text-slate-500">Closing</dt>
                    <dd className="text-base font-semibold text-slate-900">{card.closing || "—"}</dd>
                  </div>
                  <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-sm px-4 py-3 shadow-sm">
                    <dt className="text-xs uppercase tracking-wider text-slate-500">Previous</dt>
                    <dd className="text-base font-semibold text-slate-900">{card.previous || "—"}</dd>
                  </div>
                  <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-sm px-4 py-3 shadow-sm">
                    <dt className="text-xs uppercase tracking-wider text-slate-500">Volume</dt>
                    <dd className="text-base font-semibold text-slate-900">{card.volume || "—"}</dd>
                  </div>
                  <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-sm px-4 py-3 shadow-sm">
                    <dt className="text-xs uppercase tracking-wider text-slate-500">Value</dt>
                    <dd className="text-base font-semibold text-slate-900">{card.value || "—"}</dd>
                  </div>
                </dl>

                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${changeTone}`}>
                    <TrendIcon className="h-4 w-4" />
                    {card.change || "0.00"}
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href="/forms/PurchaseOrderForm"
                      className="group inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
                    >
                      Buy
                    </Link>
                    <Link
                      href="/forms/SaleOrderForm"
                      className="inline-flex items-center justify-center rounded-full border border-rose-300/70 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-rose-500 transition hover:bg-rose-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
                    >
                      Sell
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MarketCardGrid;
