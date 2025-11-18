"use client";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useMemo, useState } from "react";
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiEye,
} from "react-icons/fi";

export default function TellerOrders() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

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
  const orders = [
    {
      id: "ORD-001",
      client: "John Doe",
      clientId: "#12345",
      type: "BUY",
      company: "BK Group",
      quantity: 50,
      price: 85.5,
      total: 4275,
      date: "2025-11-17 10:30:00",
      status: "pending",
    },
    {
      id: "ORD-002",
      client: "Jane Smith",
      clientId: "#12346",
      type: "SELL",
      company: "Equity Bank",
      quantity: 25,
      price: 42.3,
      total: 1057.5,
      date: "2025-11-17 09:15:00",
      status: "pending",
    },
    {
      id: "ORD-003",
      client: "Mike Johnson",
      clientId: "#12347",
      type: "BUY",
      company: "MTN Rwanda",
      quantity: 100,
      price: 28.75,
      total: 2875,
      date: "2025-11-17 08:45:00",
      status: "completed",
    },
    {
      id: "ORD-004",
      client: "Sarah Williams",
      clientId: "#12348",
      type: "SELL",
      company: "BK Group",
      quantity: 75,
      price: 86.0,
      total: 6450,
      date: "2025-11-16 16:20:00",
      status: "completed",
    },
    {
      id: "ORD-005",
      client: "David Brown",
      clientId: "#12349",
      type: "BUY",
      company: "Bralirwa",
      quantity: 30,
      price: 145.0,
      total: 4350,
      date: "2025-11-16 14:10:00",
      status: "rejected",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            Pending
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
            <FiCheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center gap-1">
            <FiXCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "BUY" ? (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
        BUY
      </span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
        SELL
      </span>
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesType = filterType === "all" || order.type.toLowerCase() === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    pending: orders.filter((o) => o.status === "pending").length,
    completed: orders.filter((o) => o.status === "completed").length,
    rejected: orders.filter((o) => o.status === "rejected").length,
    total: orders.length,
  };

  return (
    <DashboardLayout userRole={dashboardRole} userName={displayName} userEmail={email}>
      <div className="space-y-2">
        {/* Header */}
        <div className="animate-fadeInUp space-y-2">
          <h1 className="text-2xl font-bold text-gray-600">Orders Management</h1>
          <p className="text-base text-gray-400">
            View, manage, and execute client orders across all portfolios.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 animate-slideInRight">
          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-500 mb-2">Total Orders</p>
                <p className="text-xl font-semibold text-gray-700">{stats.total}</p>
                <p className="text-sm text-gray-400">All time</p>
              </div>
              <div className="w-11 h-11 gradient-primary rounded-full flex items-center justify-center">
                <FiFilter className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-500 mb-2">Pending</p>
                <p className="text-xl font-semibold text-orange-600">{stats.pending}</p>
                <p className="text-sm text-gray-400">Awaiting action</p>
              </div>
              <div className="w-11 h-11 bg-orange-100 rounded-full flex items-center justify-center">
                <FiClock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-500 mb-2">Completed</p>
                <p className="text-xl font-semibold text-green-600">{stats.completed}</p>
                <p className="text-sm text-green-600">Successfully executed</p>
              </div>
              <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-500 mb-2">Rejected</p>
                <p className="text-xl font-semibold text-red-600">{stats.rejected}</p>
                <p className="text-sm text-gray-400">Failed execution</p>
              </div>
              <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center">
                <FiXCircle className="w-6 h-6 text-red-600" />
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
                placeholder="Search by client, company, or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B5B] focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B5B] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B5B] focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="buy">Buy Orders</option>
              <option value="sell">Sell Orders</option>
            </select>
            <Button variant="outline" className="flex items-center gap-2">
              <FiDownload className="w-4 h-4" />
              Export
            </Button>
          </div>
        </Card>

        {/* Orders Table */}
        <Card className="p-6 animate-fadeInUp">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Company</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">{order.id}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-sm">{order.client}</p>
                        <p className="text-xs text-gray-600">{order.clientId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getTypeBadge(order.type)}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">{order.company}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">{order.quantity}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">Rwf {order.price.toFixed(2)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">Rwf {order.total.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.date).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                          <FiEye className="w-4 h-4 text-gray-600" />
                        </button>
                        {order.status === "pending" && (
                          <>
                            <Button size="sm" className="px-3 py-1">
                              Execute
                            </Button>
                            <Button size="sm" variant="outline" className="px-3 py-1">
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found matching your criteria.</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
