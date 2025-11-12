import type { Metadata } from "next";
import type { JSX } from "react";
import Footer from "@/components/footer";
import Header from "@/components/header";
import MarketCardGrid from "@/components/market-card-grid";

export const metadata: Metadata = {
  title: "Market Opportunities | SunTech Broker",
  description:
    "See today\'s securities as trade-ready cards. Compare momentum, volume, and value, then act instantly with Buy or Sell controls.",
};

export default function MarketPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-[#026379]/5">
      <Header />
      <section className="bg-linear-to-b from-[#026379] via-[#01677E] to-white text-white pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-white/90 font-medium">
            Market Desk
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
            Every contract at a glance
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            Navigate Rwanda&apos;s exchange like a pro. We blend real-time snapshots with immersive card design so you can
            scan sentiment, liquidity, and price action without leaving your desk.
          </p>
        </div>
      </section>

      <div className="-mt-20 relative z-10">
        <MarketCardGrid />
      </div>

      <Footer />
    </main>
  );
}
