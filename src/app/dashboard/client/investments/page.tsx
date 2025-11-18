"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/ui/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, TrendingDown, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";

type TimeRange = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

export default function InvestmentsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("1M");

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

  const holdings = [
    { 
      symbol: "BK", 
      name: "Bank of Kigali", 
      shares: 150, 
      avgPrice: 245, 
      currentPrice: 268, 
      change: 9.39,
      value: 40200 
    },
    { 
      symbol: "EQTY", 
      name: "Equity Bank Rwanda", 
      shares: 200, 
      avgPrice: 180, 
      currentPrice: 195, 
      change: 8.33,
      value: 39000 
    },
    { 
      symbol: "MTN", 
      name: "MTN Rwanda", 
      shares: 100, 
      avgPrice: 320, 
      currentPrice: 305, 
      change: -4.69,
      value: 30500 
    },
    { 
      symbol: "BRALIRWA", 
      name: "Bralirwa Ltd", 
      shares: 80, 
      avgPrice: 425, 
      currentPrice: 448, 
      change: 5.41,
      value: 35840 
    },
  ];

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalInvested = holdings.reduce((sum, h) => sum + (h.shares * h.avgPrice), 0);
  const totalGain = totalValue - totalInvested;
  const totalGainPercent = ((totalGain / totalInvested) * 100).toFixed(2);

  const assetAllocation = [
    { name: "Banking", percentage: 54.5, color: "bg-blue-500" },
    { name: "Telecom", percentage: 21.0, color: "bg-purple-500" },
    { name: "Beverages", percentage: 24.5, color: "bg-amber-500" },
  ];

  return (
    <DashboardLayout userRole={dashboardRole} userName={displayName} userEmail={email}>
      <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Investment Portfolio</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">Track your holdings and performance across all securities</p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          <Card className="p-3 md:p-6" hover={false}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Total Value</p>
              <p className="text-xl md:text-2xl font-bold text-slate-900">Rwf {totalValue.toLocaleString()}</p>
              <div className="flex items-center gap-2 text-sm">
                {Number.parseFloat(totalGainPercent) >= 0 ? (
                  <>
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-600 font-semibold">+{totalGainPercent}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-4 w-4 text-rose-500" />
                    <span className="text-rose-600 font-semibold">{totalGainPercent}%</span>
                  </>
                )}
                <span className="text-slate-500">All time</span>
              </div>
            </div>
          </Card>

          <Card className="p-3 md:p-6" hover={false}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Total Invested</p>
              <p className="text-xl md:text-2xl font-bold text-slate-900">Rwf {totalInvested.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Initial capital deployed</p>
            </div>
          </Card>

          <Card className="p-3 md:p-6" hover={false}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Total Gain/Loss</p>
              <p className={`text-xl md:text-2xl font-bold ${totalGain >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {totalGain >= 0 ? "+" : ""}Rwf {totalGain.toLocaleString()}
              </p>
              <p className="text-sm text-slate-500">Unrealized P&L</p>
            </div>
          </Card>

          <Card className="p-3 md:p-6" hover={false}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Securities Held</p>
              <p className="text-xl md:text-2xl font-bold text-slate-900">{holdings.length}</p>
              <p className="text-sm text-slate-500">Across {assetAllocation.length} sectors</p>
            </div>
          </Card>
        </div>

        {/* Performance Chart Placeholder */}
        <Card className="p-3 md:p-6" hover={false}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-slate-900">Portfolio Performance</h2>
              <p className="text-sm md:text-base text-slate-600 mt-1">Value over time</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {(["1D", "1W", "1M", "3M", "1Y", "ALL"] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all whitespace-nowrap ${
                    timeRange === range
                      ? "bg-[#004B5B] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="h-48 md:h-64 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center border border-slate-200">
            <p className="text-slate-400 text-sm md:text-base">Performance chart visualization</p>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Holdings Table */}
          <Card className="p-3 md:p-6 lg:col-span-2" hover={false}>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-slate-900">Current Holdings</h2>
                <p className="text-sm md:text-base text-slate-600 mt-1">Your active positions</p>
              </div>
              <Button size="sm" className="text-xs md:text-sm">View All</Button>
            </div>
            <div className="overflow-x-auto -mx-3 md:mx-0">
              <div className="inline-block min-w-full align-middle px-3 md:px-0">
                <div className="overflow-hidden">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-2 text-xs md:text-sm font-semibold text-slate-700">Security</th>
                        <th className="text-right py-3 px-2 text-xs md:text-sm font-semibold text-slate-700">Shares</th>
                        <th className="text-right py-3 px-2 text-xs md:text-sm font-semibold text-slate-700 hidden sm:table-cell">Avg Price</th>
                        <th className="text-right py-3 px-2 text-xs md:text-sm font-semibold text-slate-700">Current</th>
                        <th className="text-right py-3 px-2 text-xs md:text-sm font-semibold text-slate-700">Change</th>
                        <th className="text-right py-3 px-2 text-xs md:text-sm font-semibold text-slate-700 hidden md:table-cell">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((holding) => (
                        <tr key={holding.symbol} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 md:py-4 px-2">
                            <div>
                              <p className="text-sm md:text-base font-semibold text-slate-900">{holding.symbol}</p>
                              <p className="text-xs md:text-sm text-slate-500 truncate max-w-[120px] md:max-w-none">{holding.name}</p>
                            </div>
                          </td>
                          <td className="text-right py-3 md:py-4 px-2 text-sm md:text-base text-slate-900">{holding.shares}</td>
                          <td className="text-right py-3 md:py-4 px-2 text-sm md:text-base text-slate-900 hidden sm:table-cell">Rwf {holding.avgPrice}</td>
                          <td className="text-right py-3 md:py-4 px-2 text-sm md:text-base text-slate-900 whitespace-nowrap">Rwf {holding.currentPrice}</td>
                          <td className="text-right py-3 md:py-4 px-2">
                            <div className={`inline-flex items-center gap-1 ${holding.change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              {holding.change >= 0 ? (
                                <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                              ) : (
                                <TrendingDown className="h-3 w-3 md:h-4 md:w-4" />
                              )}
                              <span className="text-xs md:text-sm font-semibold">{holding.change >= 0 ? "+" : ""}{holding.change}%</span>
                            </div>
                          </td>
                          <td className="text-right py-3 md:py-4 px-2 text-sm md:text-base font-semibold text-slate-900 whitespace-nowrap hidden md:table-cell">
                            Rwf {holding.value.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Card>

          {/* Asset Allocation */}
          <Card className="p-3 md:p-6" hover={false}>
            <div className="mb-4 md:mb-6">
              <div className="flex items-center gap-2 mb-2">
                <PieChart className="h-5 w-5 text-[#004B5B]" />
                <h2 className="text-lg md:text-xl font-semibold text-slate-900">Asset Allocation</h2>
              </div>
              <p className="text-sm md:text-base text-slate-600">Portfolio distribution by sector</p>
            </div>
            <div className="space-y-4">
              {assetAllocation.map((asset) => (
                <div key={asset.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm md:text-base font-medium text-slate-700">{asset.name}</span>
                    <span className="text-sm md:text-base font-semibold text-slate-900">{asset.percentage}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${asset.color} rounded-full transition-all duration-500`}
                      style={{ width: `${asset.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-200">
              <Button className="w-full text-xs md:text-sm" variant="outline">Rebalance Portfolio</Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
