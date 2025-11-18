"use client";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useMemo, useState } from "react";
import {
  FiDownload,
  FiTrendingUp,
  FiDollarSign,
  FiUsers,
  FiFileText,
  FiCalendar,
  FiBarChart2,
} from "react-icons/fi";

export default function TellerReports() {
  const { user } = useAuth();
  const [selectedReportType, setSelectedReportType] = useState("trading");
  const [dateRange, setDateRange] = useState("this_month");

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

  const reportTypes = [
    {
      id: "trading",
      name: "Trading Activity Report",
      description: "Comprehensive overview of all trading activities and executions",
      icon: <FiTrendingUp className="w-6 h-6" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "commission",
      name: "Commission Report",
      description: "Detailed breakdown of commission earnings by client and trade",
      icon: <FiDollarSign className="w-6 h-6" />,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "client",
      name: "Client Activity Report",
      description: "Individual client trading patterns and portfolio performance",
      icon: <FiUsers className="w-6 h-6" />,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "compliance",
      name: "Compliance Report",
      description: "Regulatory compliance, audit trails, and transaction records",
      icon: <FiFileText className="w-6 h-6" />,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  // Mock report data
  const stats = {
    totalTrades: 342,
    totalCommission: 15420.5,
    activeClients: 156,
    totalVolume: 2450000,
  };

  const recentReports = [
    {
      id: 1,
      name: "Trading Activity - November 2025",
      type: "Trading Activity",
      date: "2025-11-15",
      size: "2.4 MB",
      status: "Ready",
    },
    {
      id: 2,
      name: "Commission Report - Q4 2025",
      type: "Commission",
      date: "2025-11-10",
      size: "1.8 MB",
      status: "Ready",
    },
    {
      id: 3,
      name: "Client Activity - October 2025",
      type: "Client Activity",
      date: "2025-11-01",
      size: "3.1 MB",
      status: "Ready",
    },
    {
      id: 4,
      name: "Compliance Report - Q3 2025",
      type: "Compliance",
      date: "2025-10-31",
      size: "4.5 MB",
      status: "Ready",
    },
  ];

  return (
    <DashboardLayout userRole={dashboardRole} userName={displayName} userEmail={email}>
      <div className="space-y-2">
        {/* Header */}
        <div className="animate-fadeInUp space-y-2">
          <h1 className="text-2xl font-bold text-gray-600">Reports & Analytics</h1>
          <p className="text-base text-gray-400">
            Generate detailed reports, analyze trends, and export data for compliance and decision-making.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 animate-slideInRight">
          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-500 mb-2">Total Trades</p>
                <p className="text-xl font-semibold text-gray-700">{stats.totalTrades}</p>
                <p className="text-sm text-gray-400">This month</p>
              </div>
              <div className="w-11 h-11 gradient-primary rounded-full flex items-center justify-center">
                <FiBarChart2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-500 mb-2">Commission Earned</p>
                <p className="text-xl font-semibold text-green-600">
                  Rwf {stats.totalCommission.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">+18% from last month</p>
              </div>
              <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-500 mb-2">Active Clients</p>
                <p className="text-xl font-semibold text-gray-700">{stats.activeClients}</p>
                <p className="text-sm text-gray-400">Managed accounts</p>
              </div>
              <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-500 mb-2">Trading Volume</p>
                <p className="text-xl font-semibold text-gray-700">
                  Rwf {(stats.totalVolume / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-gray-400">This month</p>
              </div>
              <div className="w-11 h-11 bg-purple-100 rounded-full flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Generate New Report */}
        <Card className="p-6 animate-fadeInUp">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Generate New Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {reportTypes.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReportType(report.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedReportType === report.id
                    ? "border-[#004B5B] bg-[#004B5B]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${report.color}`}>
                  {report.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1">{report.name}</h3>
                <p className="text-xs text-gray-500">{report.description}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B5B] focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="this_quarter">This Quarter</option>
                <option value="this_year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B5B] focus:border-transparent">
                <option value="pdf">PDF Document</option>
                <option value="excel">Excel Spreadsheet</option>
                <option value="csv">CSV File</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button className="w-full md:w-auto flex items-center gap-2">
                <FiDownload className="w-4 h-4" />
                Generate Report
              </Button>
            </div>
          </div>
        </Card>

        {/* Recent Reports */}
        <Card className="p-6 animate-fadeInUp">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-700">Recent Reports</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Report Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Generated Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Size</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FiFileText className="w-5 h-5 text-gray-400" />
                        <p className="font-medium text-sm">{report.name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">{report.type}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiCalendar className="w-4 h-4" />
                        {new Date(report.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">{report.size}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {report.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <FiDownload className="w-4 h-4" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Scheduled Reports */}
        <div className="grid lg:grid-cols-2 gap-3">
          <Card className="p-6 animate-fadeInUp">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Scheduled Reports</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Monthly Trading Summary</p>
                  <p className="text-xs text-gray-600">Every 1st of the month</p>
                </div>
                <Button size="sm" variant="outline">Edit</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Weekly Commission Report</p>
                  <p className="text-xs text-gray-600">Every Monday at 9:00 AM</p>
                </div>
                <Button size="sm" variant="outline">Edit</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Quarterly Compliance Audit</p>
                  <p className="text-xs text-gray-600">End of each quarter</p>
                </div>
                <Button size="sm" variant="outline">Edit</Button>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              + Add Scheduled Report
            </Button>
          </Card>

          <Card className="p-6 animate-fadeInUp">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Best Performing Client</span>
                <span className="text-sm font-medium">John Doe (#12345)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Most Traded Company</span>
                <span className="text-sm font-medium">BK Group</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Commission Per Trade</span>
                <span className="text-sm font-medium text-green-600">Rwf 45.09</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Execution Success Rate</span>
                <span className="text-sm font-medium text-green-600">98.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Peak Trading Hour</span>
                <span className="text-sm font-medium">10:00 AM - 11:00 AM</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
