"use client";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useMemo, useState } from "react";
import {
  FiSearch,
  FiDownload,
  FiCheckCircle,
  FiTrendingUp,
  FiDollarSign,
  FiArrowRight,
} from "react-icons/fi";

export default function TellerExecutions() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState("today");

  const { displayName, email, dashboardRole } = useMemo((): {
    displayName: string;
    email: string;
    dashboardRole: "teller";
  } => {
    const fullName = (user?.fullName as string | undefined)?.trim() ?? "";
    const fallbackName = user?.email ? user.email.split("@")[0] : "Teller";

    return {
      displayName: fullName || fallbackName,
      email: user?.email ?? "Not provided",
      dashboardRole: "teller",
    };
  }, [user?.email, user?.fullName]);

  // Mock data - replace with actual API calls
  const executions = [
    {
      id: "EXE-001",
      buyer: "John Doe",
      buyerId: "#12345",
      seller: "Sarah Williams",
      sellerId: "#12348",
      company: "BK Group",
      quantity: 50,
      price: 85.75,
      total: 4287.5,
      commission: 42.88,
      date: "2025-11-17 11:30:00",
      type: "matched",
    },
    {
      id: "EXE-002",
      buyer: "Mike Johnson",
      buyerId: "#12347",
      seller: "Company Holdings",
      sellerId: "#COMP-01",
      company: "MTN Rwanda",
      quantity: 100,
      price: 28.75,
      total: 2875,
      commission: 28.75,
      date: "2025-11-17 10:15:00",
      type: "matched",
    },
    {
      id: "EXE-003",
      buyer: "Alice Brown",
      buyerId: "#12350",
      seller: "David Wilson",
      sellerId: "#12351",
      company: "Equity Bank",
      quantity: 75,
      price: 42.5,
      total: 3187.5,
      commission: 31.88,
      date: "2025-11-17 09:45:00",
      type: "matched",
    },
    {
      id: "EXE-004",
      buyer: "Robert Smith",
      buyerId: "#12352",
      seller: "Emma Davis",
      sellerId: "#12353",
      company: "Bralirwa",
      quantity: 30,
      price: 145.0,
      total: 4350,
      commission: 43.5,
      date: "2025-11-16 16:20:00",
      type: "matched",
    },
  ];

  const filteredExecutions = executions.filter((execution) => {
    const matchesSearch =
      execution.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      execution.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
      execution.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      execution.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || execution.type === filterType;

    return matchesSearch && matchesType;
  });

  const stats = {
    todayExecutions: executions.length,
    totalVolume: executions.reduce((sum, exe) => sum + exe.total, 0),
    totalCommission: executions.reduce((sum, exe) => sum + exe.commission, 0),
    avgPrice: executions.reduce((sum, exe) => sum + exe.price, 0) / executions.length || 0,
  };

  return (
    <DashboardLayout userRole={dashboardRole} userName={displayName} userEmail={email}>
      <div className="space-y-2">
        {/* Header */}
        <div className="animate-fadeInUp space-y-2">
          <h1 className="text-2xl font-bold text-gray-600">Trade Executions</h1>
          <p className="text-base text-gray-400">
            Monitor and manage executed trades, matched orders, and transaction settlements.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 animate-slideInRight">
          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-500 mb-2">Today&apos;s Executions</p>
                <p className="text-xl font-semibold text-gray-700">{stats.todayExecutions}</p>
                <p className="text-sm text-gray-400">Completed trades</p>
              </div>
              <div className="w-11 h-11 gradient-primary rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-500 mb-2">Total Volume</p>
                <p className="text-xl font-semibold text-gray-700">
                  Rwf {stats.totalVolume.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">+12% from yesterday</p>
              </div>
              <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-500 mb-2">Commission Earned</p>
                <p className="text-xl font-semibold text-blue-600">
                  Rwf {stats.totalCommission.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">Today</p>
              </div>
              <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-500 mb-2">Avg Price</p>
                <p className="text-xl font-semibold text-gray-700">
                  Rwf {stats.avgPrice.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">Per share</p>
              </div>
              <div className="w-11 h-11 bg-purple-100 rounded-full flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6 animate-fadeInUp">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by buyer, seller, company, or execution ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B5B] focus:border-transparent"
              />
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B5B] focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B5B] focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="matched">Matched Trades</option>
              <option value="direct">Direct Trades</option>
            </select>
            <Button variant="outline" className="flex items-center gap-2">
              <FiDownload className="w-4 h-4" />
              Export
            </Button>
          </div>
        </Card>

        {/* Executions Table */}
        <Card className="p-6 animate-fadeInUp">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Execution ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Trade Match</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Company</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Value</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Commission</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredExecutions.map((execution) => (
                  <tr key={execution.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">{execution.id}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium text-sm text-green-600">{execution.buyer}</p>
                          <p className="text-xs text-gray-500">{execution.buyerId}</p>
                        </div>
                        <FiArrowRight className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-sm text-red-600">{execution.seller}</p>
                          <p className="text-xs text-gray-500">{execution.sellerId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">{execution.company}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">{execution.quantity}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">Rwf {execution.price.toFixed(2)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">Rwf {execution.total.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm text-blue-600">
                        Rwf {execution.commission.toFixed(2)}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">
                        {new Date(execution.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(execution.date).toLocaleTimeString()}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredExecutions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No executions found matching your criteria.</p>
            </div>
          )}
        </Card>

        {/* Recent Activity Summary */}
        <div className="grid lg:grid-cols-2 gap-3">
          <Card className="p-6 animate-fadeInUp">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Traded Companies Today</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">BK Group</p>
                  <p className="text-xs text-gray-600">150 shares traded</p>
                </div>
                <span className="text-green-600 font-semibold text-sm">Rwf 12,862</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">MTN Rwanda</p>
                  <p className="text-xs text-gray-600">100 shares traded</p>
                </div>
                <span className="text-green-600 font-semibold text-sm">Rwf 2,875</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Equity Bank</p>
                  <p className="text-xs text-gray-600">75 shares traded</p>
                </div>
                <span className="text-green-600 font-semibold text-sm">Rwf 3,188</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 animate-fadeInUp">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium text-green-600">98.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Execution Time</span>
                <span className="text-sm font-medium">2.3 minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Commission Rate</span>
                <span className="text-sm font-medium">1.0%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Settlement Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">All Settled</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
