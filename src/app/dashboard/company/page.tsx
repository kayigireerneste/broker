"use client";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";
import {
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiBarChart2,
  FiArrowUpRight,
  FiArrowDownRight,
} from "react-icons/fi";

export default function CompanyDashboard() {
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

  const stats = [
    {
      title: "Share Price",
      value: "Rwf 245.50",
      change: "+12.5%",
      trend: "up",
      icon: <FiTrendingUp className="w-6 h-6 text-green-400" />,
      bgColor: "bg-green-100",
    },
    {
      title: "Market Cap",
      value: "Rwf 24.5B",
      change: "+8.2%",
      trend: "up",
      icon: <FiBarChart2 className="w-6 h-6 text-blue-400" />,
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Shareholders",
      value: "1,234",
      change: "+23",
      trend: "up",
      icon: <FiUsers className="w-6 h-6 text-purple-400" />,
      bgColor: "bg-purple-100",
    },
    {
      title: "Trading Volume",
      value: "Rwf 485K",
      change: "-5.3%",
      trend: "down",
      icon: <FiDollarSign className="w-6 h-6 text-orange-400" />,
      bgColor: "bg-orange-100",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "buy",
      investor: "John Doe",
      shares: 50,
      price: 245.5,
      total: 12275,
      time: "2 minutes ago",
    },
    {
      id: 2,
      type: "sell",
      investor: "Jane Smith",
      shares: 30,
      price: 244.8,
      total: 7344,
      time: "15 minutes ago",
    },
    {
      id: 3,
      type: "buy",
      investor: "Mike Johnson",
      shares: 100,
      price: 246.0,
      total: 24600,
      time: "1 hour ago",
    },
  ];

  const topShareholders = [
    { name: "Investment Fund A", shares: 15000, percentage: 12.5 },
    { name: "John Doe Holdings", shares: 12000, percentage: 10.0 },
    { name: "Jane Smith Capital", shares: 8500, percentage: 7.1 },
    { name: "Corporate Investors Ltd", shares: 7200, percentage: 6.0 },
  ];

  return (
    <DashboardLayout userRole={dashboardRole} userName={displayName} userEmail={email}>
      <div className="space-y-2">
        {/* Header */}
        <div className="animate-fadeInUp space-y-2">
          <h1 className="text-2xl font-bold text-gray-600">Company Dashboard</h1>
          <p className="text-base text-gray-400">
            Monitor your company&apos;s stock performance, shareholders, and market activity.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 animate-slideInRight">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium text-gray-500 mb-2">{stat.title}</p>
                  <p className="text-xl font-semibold text-gray-700">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === "up" ? (
                      <FiArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <FiArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <p className={`text-sm ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-3">
          {/* Recent Trading Activity */}
          <Card className="lg:col-span-2 p-6 animate-fadeInUp">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-700">Recent Trading Activity</h2>
              <Button size="sm" variant="outline">View All</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Investor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Shares</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity) => (
                    <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {activity.type === "buy" ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            BUY
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                            SELL
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-sm">{activity.investor}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-sm">{activity.shares}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-sm">Rwf {activity.price.toFixed(2)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-sm">Rwf {activity.total.toLocaleString()}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Top Shareholders */}
          <Card className="p-6 animate-slideInRight">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Shareholders</h3>
            <div className="space-y-3">
              {topShareholders.map((shareholder, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{shareholder.name}</p>
                    <p className="text-xs text-gray-600">{shareholder.shares.toLocaleString()} shares</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-gray-700">{shareholder.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              View All Shareholders
            </Button>
          </Card>
        </div>

        {/* Quick Actions & Performance */}
        <div className="grid lg:grid-cols-2 gap-3">
          <Card className="p-6 animate-fadeInUp">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button className="w-full justify-start" variant="outline">
                <FiTrendingUp className="w-5 h-5 mr-3" />
                Issue Shares
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FiUsers className="w-5 h-5 mr-3" />
                Add Shareholder
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FiBarChart2 className="w-5 h-5 mr-3" />
                View Reports
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FiDollarSign className="w-5 h-5 mr-3" />
                Dividends
              </Button>
            </div>
          </Card>

          <Card className="p-6 animate-fadeInUp">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">52-Week High</span>
                <span className="text-sm font-medium">Rwf 268.50</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">52-Week Low</span>
                <span className="text-sm font-medium">Rwf 185.20</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">P/E Ratio</span>
                <span className="text-sm font-medium">18.5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dividend Yield</span>
                <span className="text-sm font-medium text-green-600">3.2%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
