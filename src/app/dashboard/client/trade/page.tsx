"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/ui/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, Activity, Search, ArrowUpRight, ArrowDownRight } from "lucide-react";

type OrderType = "buy" | "sell";
type PriceType = "market" | "limit";

export default function TradePage() {
  const { user } = useAuth();
  const [orderType, setOrderType] = useState<OrderType>("buy");
  const [priceType, setPriceType] = useState<PriceType>("market");
  const [selectedSecurity, setSelectedSecurity] = useState("BK");
  const [quantity, setQuantity] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { displayName, email, dashboardRole } = useMemo(() => {
    const fullName = (user?.fullName as string | undefined)?.trim() ?? "";
    const fallbackName = user?.email ? user.email.split("@")[0] : "Client";
    const role = user?.role?.toLowerCase();
    const dashboardRole =
      role === "client" || role === "teller" || role === "admin" ? (role as "client" | "teller" | "admin") : "client";
    return {
      displayName: fullName || fallbackName,
      email: user?.email ?? "Not provided",
      dashboardRole,
    };
  }, [user?.email, user?.fullName, user?.role]);

  const securities = [
    { 
      symbol: "BK", 
      name: "Bank of Kigali", 
      price: 268, 
      change: 2.3, 
      volume: "15,420",
      high: 272,
      low: 265,
      bid: 267,
      ask: 268
    },
    { 
      symbol: "EQTY", 
      name: "Equity Bank Rwanda", 
      price: 195, 
      change: 1.5, 
      volume: "8,930",
      high: 198,
      low: 192,
      bid: 194,
      ask: 195
    },
    { 
      symbol: "MTN", 
      name: "MTN Rwanda", 
      price: 305, 
      change: -1.2, 
      volume: "12,150",
      high: 310,
      low: 303,
      bid: 304,
      ask: 305
    },
    { 
      symbol: "BRALIRWA", 
      name: "Bralirwa Ltd", 
      price: 448, 
      change: 0.8, 
      volume: "5,680",
      high: 450,
      low: 445,
      bid: 447,
      ask: 448
    },
    { 
      symbol: "KCB", 
      name: "KCB Rwanda", 
      price: 182, 
      change: -0.5, 
      volume: "6,200",
      high: 185,
      low: 181,
      bid: 181,
      ask: 182
    },
  ];

  const filteredSecurities = securities.filter(
    (sec) =>
      sec.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSecurity = securities.find((s) => s.symbol === selectedSecurity) || securities[0];

  const estimatedTotal = useMemo(() => {
    const qty = Number.parseInt(quantity, 10) || 0;
    const price = priceType === "market" 
      ? currentSecurity.price 
      : Number.parseFloat(limitPrice) || 0;
    return qty * price;
  }, [quantity, limitPrice, priceType, currentSecurity.price]);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Order submitted:", {
      orderType,
      priceType,
      security: selectedSecurity,
      quantity,
      limitPrice: priceType === "limit" ? limitPrice : undefined,
    });
    // Reset form
    setQuantity("");
    setLimitPrice("");
  };

  return (
    <DashboardLayout userRole={dashboardRole} userName={displayName} userEmail={email}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trading Desk</h1>
          <p className="text-base text-slate-600 mt-1">Execute trades and monitor live market data</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4" hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Wallet Balance</p>
                <p className="text-xl font-bold text-slate-900">Rwf 3,420</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4" hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Buying Power</p>
                <p className="text-xl font-bold text-slate-900">Rwf 3,420</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4" hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Open Orders</p>
                <p className="text-xl font-bold text-slate-900">3</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4" hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Today&apos;s Trades</p>
                <p className="text-xl font-bold text-slate-900">0</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trading Form */}
          <Card className="p-6 lg:col-span-2" hover={false}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Place Order</h2>
              <p className="text-base text-slate-600 mt-1">Execute a buy or sell order</p>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Order Type Toggle */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType("buy")}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                    orderType === "buy"
                      ? "bg-emerald-500 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("sell")}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                    orderType === "sell"
                      ? "bg-rose-500 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Sell
                </button>
              </div>

              {/* Security Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Security
                </label>
                <select
                  value={selectedSecurity}
                  onChange={(e) => setSelectedSecurity(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-[#004B5B] focus:outline-none focus:ring-2 focus:ring-[#004B5B]/20"
                >
                  {securities.map((sec) => (
                    <option key={sec.symbol} value={sec.symbol}>
                      {sec.symbol} - {sec.name} (Rwf {sec.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Order Type
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPriceType("market")}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                      priceType === "market"
                        ? "bg-[#004B5B] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Market
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceType("limit")}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                      priceType === "limit"
                        ? "bg-[#004B5B] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Limit
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <InputField
                name="quantity"
                label="Quantity (Shares)"
                type="number"
                placeholder="Enter number of shares"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />

              {/* Limit Price (conditional) */}
              {/* Limit Price (conditional) */}
              {priceType === "limit" && (
                <InputField
                  name="limitPrice"
                  label="Limit Price (Rwf)"
                  type="number"
                  placeholder="Enter your limit price"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                />
              )}
              {/* Order Summary */}
              <div className="rounded-2xl bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between text-base">
                  <span className="text-slate-600">Current Price</span>
                  <span className="font-semibold text-slate-900">Rwf {currentSecurity.price}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-slate-600">Quantity</span>
                  <span className="font-semibold text-slate-900">{quantity || 0} shares</span>
                </div>
                {priceType === "limit" && (
                  <div className="flex justify-between text-base">
                    <span className="text-slate-600">Limit Price</span>
                    <span className="font-semibold text-slate-900">Rwf {limitPrice || 0}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-200 flex justify-between text-lg">
                  <span className="font-semibold text-slate-700">Estimated Total</span>
                  <span className="font-bold text-slate-900">Rwf {estimatedTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className={`flex-1 ${
                    orderType === "buy" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"
                  }`}
                  disabled={!quantity || (priceType === "limit" && !limitPrice)}
                >
                  {orderType === "buy" ? "Place Buy Order" : "Place Sell Order"}
                </Button>
                <Button type="button" variant="outline" className="px-6">
                  Reset
                </Button>
              </div>

              {/* Quick Links */}
              <div className="pt-4 border-t border-slate-200 flex gap-3">
                <Link
                  href="/forms/PurchaseOrderForm"
                  className="text-sm text-[#004B5B] hover:underline font-medium"
                >
                  Advanced Buy Form →
                </Link>
                <Link
                  href="/forms/SaleOrderForm"
                  className="text-sm text-[#004B5B] hover:underline font-medium"
                >
                  Advanced Sell Form →
                </Link>
              </div>
            </form>
          </Card>

          {/* Market Watch */}
          <Card className="p-6" hover={false}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Market Watch</h2>
              <p className="text-base text-slate-600 mt-1">Live securities prices</p>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search securities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#004B5B] focus:outline-none focus:ring-2 focus:ring-[#004B5B]/20"
              />
            </div>

            {/* Securities List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredSecurities.map((sec) => (
                <button
                  key={sec.symbol}
                  onClick={() => setSelectedSecurity(sec.symbol)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedSecurity === sec.symbol
                      ? "border-[#004B5B] bg-[#004B5B]/5"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{sec.symbol}</p>
                      <p className="text-xs text-slate-500">{sec.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">Rwf {sec.price}</p>
                      <div className={`flex items-center gap-1 text-xs font-semibold ${
                        sec.change >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {sec.change >= 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        <span>{sec.change >= 0 ? "+" : ""}{sec.change}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-500">Vol:</span> {sec.volume}
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500">H/L:</span> {sec.high}/{sec.low}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <Link
                href="/market"
                className="block text-center text-sm font-medium text-[#004B5B] hover:underline"
              >
                View Full Market →
              </Link>
            </div>
          </Card>
        </div>

        {/* Selected Security Details */}
        <Card className="p-6" hover={false}>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">{currentSecurity.name} ({currentSecurity.symbol})</h2>
            <p className="text-base text-slate-600 mt-1">Current market data</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl bg-slate-50">
              <p className="text-sm text-slate-600 mb-1">Last Price</p>
              <p className="text-lg font-bold text-slate-900">Rwf {currentSecurity.price}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50">
              <p className="text-sm text-slate-600 mb-1">Change</p>
              <p className={`text-lg font-bold ${currentSecurity.change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {currentSecurity.change >= 0 ? "+" : ""}{currentSecurity.change}%
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50">
              <p className="text-sm text-slate-600 mb-1">Volume</p>
              <p className="text-lg font-bold text-slate-900">{currentSecurity.volume}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50">
              <p className="text-sm text-slate-600 mb-1">Day High</p>
              <p className="text-lg font-bold text-slate-900">Rwf {currentSecurity.high}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50">
              <p className="text-sm text-slate-600 mb-1">Day Low</p>
              <p className="text-lg font-bold text-slate-900">Rwf {currentSecurity.low}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50">
              <p className="text-sm text-slate-600 mb-1">Bid/Ask</p>
              <p className="text-lg font-bold text-slate-900">{currentSecurity.bid}/{currentSecurity.ask}</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
