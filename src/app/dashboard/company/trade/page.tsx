"use client";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useMemo, useState } from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

export default function CompanyTrade() {
  const { user } = useAuth();
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [selectedStock, setSelectedStock] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const { displayName, email, dashboardRole } = useMemo((): {
    displayName: string;
    email: string;
    dashboardRole: "company";
  } => {
    const fullName = (user?.fullName as string | undefined)?.trim() ?? "";
    const fallbackName = user?.email ? user.email.split("@")[0] : "Company";

    return {
      displayName: fullName || fallbackName,
      email: user?.email ?? "Not provided",
      dashboardRole: "company",
    };
  }, [user?.email, user?.fullName]);

  const availableStocks = [
    { ticker: "BK", name: "Bank of Kigali", price: 268.0, change: 2.5 },
    { ticker: "MTN", name: "MTN Rwanda", price: 142.5, change: -1.2 },
    { ticker: "EQUITY", name: "Equity Bank", price: 88.0, change: 0.8 },
    { ticker: "BLR", name: "Bralirwa", price: 485.0, change: 3.1 },
  ];

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle order submission logic here
    console.log({ orderType, selectedStock, quantity, price });
  };

  return (
    <DashboardLayout userRole={dashboardRole} userName={displayName} userEmail={email}>
      <div className="space-y-2">
        {/* Header */}
        <div className="animate-fadeInUp space-y-2">
          <h1 className="text-2xl font-bold text-gray-600">Trade Stocks</h1>
          <p className="text-base text-gray-400">
            Buy and sell company shares on the Rwanda Stock Exchange.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-3">
          {/* Order Form */}
          <Card className="lg:col-span-2 p-6 animate-fadeInUp">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Place Order</h2>

            {/* Order Type Toggle */}
            <div className="flex gap-2 mb-6">
              <Button
                onClick={() => setOrderType("buy")}
                className={`flex-1 ${orderType === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                <FiTrendingUp className="w-5 h-5 mr-2" />
                Buy
              </Button>
              <Button
                onClick={() => setOrderType("sell")}
                className={`flex-1 ${orderType === "sell" ? "bg-red-600 hover:bg-red-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                <FiTrendingDown className="w-5 h-5 mr-2" />
                Sell
              </Button>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Stock
                </label>
                <select
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B5B] focus:border-transparent"
                  required
                >
                  <option value="">Choose a stock...</option>
                  {availableStocks.map((stock) => (
                    <option key={stock.ticker} value={stock.ticker}>
                      {stock.name} ({stock.ticker}) - Rwf {stock.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (Shares)
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    min="1"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B5B] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Share (Rwf)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B5B] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Type
                </label>
                <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B5B] focus:border-transparent">
                  <option value="market">Market Order</option>
                  <option value="limit">Limit Order</option>
                  <option value="stop">Stop Order</option>
                </select>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="text-lg font-bold text-gray-700">
                    Rwf {(parseFloat(quantity || "0") * parseFloat(price || "0")).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Commission (1%):</span>
                  <span className="text-sm font-medium text-gray-600">
                    Rwf {((parseFloat(quantity || "0") * parseFloat(price || "0")) * 0.01).toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className={`w-full ${orderType === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {orderType === "buy" ? "Place Buy Order" : "Place Sell Order"}
              </Button>
            </form>
          </Card>

          {/* Market Overview */}
          <Card className="p-6 animate-slideInRight">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Market Overview</h3>
            <div className="space-y-3">
              {availableStocks.map((stock) => (
                <div key={stock.ticker} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{stock.ticker}</p>
                      <p className="text-xs text-gray-600">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">Rwf {stock.price.toFixed(2)}</p>
                      <p className={`text-xs ${stock.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {stock.change >= 0 ? "+" : ""}{stock.change}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Market Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Open
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Trading Hours:</span>
                  <span className="text-xs font-medium">9:00 AM - 3:00 PM</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
