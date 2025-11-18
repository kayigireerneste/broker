"use client";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiDollarSign,
  FiBarChart2,
} from "react-icons/fi";

export default function CompanyInvestments() {
  const { user } = useAuth();

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

  const portfolioStats = [
    {
      title: "Total Portfolio Value",
      value: "Rwf 125.5M",
      change: "+15.2%",
      icon: <FiDollarSign className="w-6 h-6 text-white" />,
      bgColor: "gradient-primary",
    },
    {
      title: "Total Investments",
      value: "24",
      change: "+3 this month",
      icon: <FiPieChart className="w-6 h-6 text-blue-400" />,
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Returns",
      value: "Rwf 18.2M",
      change: "+22.5%",
      icon: <FiTrendingUp className="w-6 h-6 text-green-400" />,
      bgColor: "bg-green-100",
    },
    {
      title: "Active Positions",
      value: "18",
      change: "6 pending",
      icon: <FiBarChart2 className="w-6 h-6 text-purple-400" />,
      bgColor: "bg-purple-100",
    },
  ];

  const investments = [
    {
      id: 1,
      company: "Bank of Kigali",
      ticker: "BK",
      shares: 5000,
      avgPrice: 235.5,
      currentPrice: 268.0,
      totalValue: 1340000,
      returnPercentage: 13.8,
      returnAmount: 162500,
    },
    {
      id: 2,
      company: "MTN Rwanda",
      ticker: "MTN",
      shares: 3000,
      avgPrice: 125.0,
      currentPrice: 142.5,
      totalValue: 427500,
      returnPercentage: 14.0,
      returnAmount: 52500,
    },
    {
      id: 3,
      company: "Equity Bank",
      ticker: "EQUITY",
      shares: 4500,
      avgPrice: 95.5,
      currentPrice: 88.0,
      totalValue: 396000,
      returnPercentage: -7.9,
      returnAmount: -33750,
    },
    {
      id: 4,
      company: "Bralirwa",
      ticker: "BLR",
      shares: 2000,
      avgPrice: 450.0,
      currentPrice: 485.0,
      totalValue: 970000,
      returnPercentage: 7.8,
      returnAmount: 70000,
    },
  ];

  return (
    <DashboardLayout userRole={dashboardRole} userName={displayName} userEmail={email}>
      <div className="space-y-2">
        {/* Header */}
        <div className="animate-fadeInUp space-y-2">
          <h1 className="text-2xl font-bold text-gray-600">Investment Portfolio</h1>
          <p className="text-base text-gray-400">
            Track your company&apos;s investments, holdings, and portfolio performance.
          </p>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 animate-slideInRight">
          {portfolioStats.map((stat, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium text-gray-500 mb-2">{stat.title}</p>
                  <p className="text-xl font-semibold text-gray-700">{stat.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{stat.change}</p>
                </div>
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Investment Holdings */}
        <Card className="p-6 animate-fadeInUp">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-700">Investment Holdings</h2>
            <Button size="sm">Add Investment</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Company</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Shares</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Current Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Value</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Return</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((investment) => (
                  <tr key={investment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-sm">{investment.company}</p>
                        <p className="text-xs text-gray-500">{investment.ticker}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">{investment.shares.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">Rwf {investment.avgPrice.toFixed(2)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">Rwf {investment.currentPrice.toFixed(2)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">Rwf {investment.totalValue.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center gap-1">
                          {investment.returnPercentage >= 0 ? (
                            <FiTrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <FiTrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <p className={`font-medium text-sm ${investment.returnPercentage >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {investment.returnPercentage >= 0 ? "+" : ""}{investment.returnPercentage}%
                          </p>
                        </div>
                        <p className={`text-xs ${investment.returnPercentage >= 0 ? "text-green-600" : "text-red-600"}`}>
                          Rwf {investment.returnAmount.toLocaleString()}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm" variant="outline">Trade</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Asset Allocation & Performance */}
        <div className="grid lg:grid-cols-2 gap-3">
          <Card className="p-6 animate-fadeInUp">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Asset Allocation</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Financial Services</span>
                  <span className="text-sm font-medium">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Telecommunications</span>
                  <span className="text-sm font-medium">25%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "25%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Consumer Goods</span>
                  <span className="text-sm font-medium">20%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: "20%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Others</span>
                  <span className="text-sm font-medium">10%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: "10%" }}></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 animate-fadeInUp">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Performers</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">MTN Rwanda</p>
                  <p className="text-xs text-gray-600">3,000 shares</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-green-600">+14.0%</p>
                  <p className="text-xs text-gray-600">Rwf 52,500</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Bank of Kigali</p>
                  <p className="text-xs text-gray-600">5,000 shares</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-green-600">+13.8%</p>
                  <p className="text-xs text-gray-600">Rwf 162,500</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Equity Bank</p>
                  <p className="text-xs text-gray-600">4,500 shares</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-red-600">-7.9%</p>
                  <p className="text-xs text-gray-600">Rwf -33,750</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
