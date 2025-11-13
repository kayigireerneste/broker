import type { Metadata } from "next";
import type { JSX } from "react";
import Footer from "@/components/footer";
import Header from "@/components/header";
import MarketCardGrid from "@/components/market-card-grid";
import { MarketHero } from "@/components/market-hero";

export const metadata: Metadata = {
  title: "Market Opportunities | SunTech Broker",
  description:
    "See today's securities as trade-ready cards. Compare momentum, volume, and value, then act instantly with Buy or Sell controls.",
};

export default function MarketPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header />
      
      {/* Animated Hero Section */}
      <MarketHero />

      {/* Market Cards Section */}
      <div id="securities" className="-mt-12 relative z-10">
        <MarketCardGrid />
      </div>

      <Footer />
    </main>
  );
}
