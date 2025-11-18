"use client";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useMemo, useState } from "react";
import {
  FiSearch,
  FiDownload,
  FiArrowRight,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";

export default function ShareMovement() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

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

  const movements = [
    {
      id: 1,
      type: "transfer",
      from: "John Doe",
      to: "Jane Smith",
      shares: 500,
      date: "2025-11-17 10:30:00",
      status: "completed",
      reason: "Sale Agreement",
    },
    {
      id: 2,
      type: "issue",
      from: "Company",
      to: "Mike Johnson",
      shares: 1000,
      date: "2025-11-16 14:20:00",
      status: "completed",
      reason: "New Share Issuance",
    },
    {
      id: 3,
      type: "buyback",
      from: "Sarah Williams",
      to: "Company",
      shares: 300,
      date: "2025-11-15 09:15:00",
      status: "completed",
      reason: "Share Buyback Program",
    },
    {
      id: 4,
      type: "transfer",
      from: "David Brown",
      to: "Emma Davis",
      shares: 750,
      date: "2025-11-14 16:45:00",
      status: "pending",
      reason: "Inheritance Transfer",
    },
  ];

  const stats = [
    {
      title: "Total Movements",
      value: "234",
      subtitle: "This month",
    },
    {
      title: "Shares Transferred",
      value: "45,600",
      subtitle: "This month",
    },
    {
      title: "New Issuances",
      value: "12,000",
      subtitle: "This quarter",
    },
    {
      title: "Buybacks",
      value: "8,500",
      subtitle: "This quarter",
    },
  ];

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "transfer":
        return <FiArrowRight className="w-4 h-4 text-blue-600" />;
      case "issue":
        return <FiArrowUp className="w-4 h-4 text-green-600" />;
      case "buyback":
        return <FiArrowDown className="w-4 h-4 text-orange-600" />;
      default:
        return <FiArrowRight className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case "transfer":
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Transfer</span>;
      case "issue":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Issue</span>;
      case "buyback":
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">Buyback</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Other</span>;
    }
  };

  const filteredMovements = movements.filter((movement) => {
    const matchesSearch =
      movement.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || movement.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout userRole={dashboardRole} userName={displayName} userEmail={email}>
      <div className="space-y-2">
        {/* Header */}
        <div className="animate-fadeInUp space-y-2">
          <h1 className="text-2xl font-bold text-gray-600">Share Movement</h1>
          <p className="text-base text-gray-400">
            Track share transfers, issuances, buybacks, and all ownership changes.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 animate-slideInRight">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all">
              <p className="text-base font-medium text-gray-500 mb-2">{stat.title}</p>
              <p className="text-xl font-semibold text-gray-700">{stat.value}</p>
              <p className="text-sm text-gray-400 mt-1">{stat.subtitle}</p>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-6 animate-fadeInUp">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by shareholder or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B5B] focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B5B] focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="transfer">Transfers</option>
              <option value="issue">Issuances</option>
              <option value="buyback">Buybacks</option>
            </select>
            <Button variant="outline" className="flex items-center gap-2">
              <FiDownload className="w-4 h-4" />
              Export
            </Button>
          </div>
        </Card>

        {/* Movements Table */}
        <Card className="p-6 animate-fadeInUp">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Movement</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Shares</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Reason</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((movement) => (
                  <tr key={movement.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{getMovementBadge(movement.type)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{movement.from}</p>
                        {getMovementIcon(movement.type)}
                        <p className="font-medium text-sm">{movement.to}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">{movement.shares.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">
                        {new Date(movement.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(movement.date).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">{movement.reason}</p>
                    </td>
                    <td className="py-3 px-4">
                      {movement.status === "completed" ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMovements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No share movements found matching your criteria.</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
