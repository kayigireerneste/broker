"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/ui/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { 
  History, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ShoppingCart, 
  TrendingDown,
  Filter,
  Download,
  Search,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

type HistoryFilter = "all" | "trades" | "deposits" | "withdrawals";
type StatusFilter = "all" | "completed" | "pending" | "failed";

export default function HistoryPage() {
  const { user } = useAuth();
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  const allHistory = useMemo(() => [
    {
      id: "TRD001",
      type: "buy",
      category: "trade",
      security: "BK",
      description: "Bought 50 shares of Bank of Kigali",
      amount: 13400,
      quantity: 50,
      price: 268,
      status: "completed",
      date: "2025-11-12 14:30",
    },
    {
      id: "DEP001",
      type: "deposit",
      category: "deposit",
      description: "Mobile Money deposit",
      amount: 50000,
      status: "completed",
      date: "2025-11-12 10:30",
    },
    {
      id: "TRD002",
      type: "sell",
      category: "trade",
      security: "MTN",
      description: "Sold 30 shares of MTN Rwanda",
      amount: 9150,
      quantity: 30,
      price: 305,
      status: "completed",
      date: "2025-11-11 16:20",
    },
    {
      id: "WTH001",
      type: "withdraw",
      category: "withdrawal",
      description: "Bank transfer withdrawal",
      amount: 15000,
      status: "pending",
      date: "2025-11-11 09:15",
    },
    {
      id: "TRD003",
      type: "buy",
      category: "trade",
      security: "EQTY",
      description: "Bought 100 shares of Equity Bank",
      amount: 19500,
      quantity: 100,
      price: 195,
      status: "completed",
      date: "2025-11-10 11:45",
    },
    {
      id: "DEP002",
      type: "deposit",
      category: "deposit",
      description: "Credit card deposit",
      amount: 100000,
      status: "completed",
      date: "2025-11-10 09:15",
    },
    {
      id: "TRD004",
      type: "buy",
      category: "trade",
      security: "BRALIRWA",
      description: "Bought 40 shares of Bralirwa Ltd",
      amount: 17920,
      quantity: 40,
      price: 448,
      status: "completed",
      date: "2025-11-09 15:30",
    },
    {
      id: "WTH002",
      type: "withdraw",
      category: "withdrawal",
      description: "Bank transfer withdrawal",
      amount: 25000,
      status: "completed",
      date: "2025-11-09 14:20",
    },
    {
      id: "TRD005",
      type: "sell",
      category: "trade",
      security: "BK",
      description: "Sold 20 shares of Bank of Kigali",
      amount: 5360,
      quantity: 20,
      price: 268,
      status: "failed",
      date: "2025-11-08 13:10",
    },
    {
      id: "DEP003",
      type: "deposit",
      category: "deposit",
      description: "Mobile Money deposit",
      amount: 75000,
      status: "completed",
      date: "2025-11-08 11:00",
    },
  ], []);

  const filteredHistory = useMemo(() => {
    return allHistory.filter((item) => {
      // Filter by category
      if (historyFilter !== "all") {
        if (historyFilter === "trades" && item.category !== "trade") return false;
        if (historyFilter === "deposits" && item.category !== "deposit") return false;
        if (historyFilter === "withdrawals" && item.category !== "withdrawal") return false;
      }

      // Filter by status
      if (statusFilter !== "all" && item.status !== statusFilter) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesId = item.id.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesSecurity = item.security?.toLowerCase().includes(query);
        if (!matchesId && !matchesDesc && !matchesSecurity) return false;
      }

      // Filter by date range
      if (dateFrom && new Date(item.date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(item.date) > new Date(dateTo)) return false;

      return true;
    });
  }, [allHistory, historyFilter, statusFilter, searchQuery, dateFrom, dateTo]);

  const getTypeIcon = (category: string, type: string) => {
    switch (category) {
      case "trade":
        return type === "buy" ? <ShoppingCart className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />;
      case "deposit":
        return <ArrowDownToLine className="h-5 w-5" />;
      case "withdrawal":
        return <ArrowUpFromLine className="h-5 w-5" />;
      default:
        return <History className="h-5 w-5" />;
    }
  };

  const getTypeColor = (category: string, type: string) => {
    switch (category) {
      case "trade":
        return type === "buy" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700";
      case "deposit":
        return "bg-blue-100 text-blue-700";
      case "withdrawal":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "failed":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const exportHistory = () => {
    console.log("Exporting history...");
    // Implementation for CSV/PDF export
  };

  return (
    <DashboardLayout userRole={dashboardRole} userName={displayName} userEmail={email}>
      <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Transaction History</h1>
            <p className="text-sm md:text-base text-slate-600 mt-1">View and manage all your account activity</p>
          </div>
          <Button onClick={exportHistory} variant="outline" className="flex items-center gap-2 text-xs md:text-sm shrink-0">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <Card className="p-2 md:p-4" hover={false}>
            <div className="flex items-center gap-1.5 md:gap-3">
              <div className="h-7 w-7 md:h-10 md:w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <History className="h-3.5 w-3.5 md:h-5 md:w-5 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-sm font-medium text-slate-600 truncate">Total</p>
                <p className="text-sm md:text-xl font-bold text-slate-900">{allHistory.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-2 md:p-4" hover={false}>
            <div className="flex items-center gap-1.5 md:gap-3">
              <div className="h-7 w-7 md:h-10 md:w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <ShoppingCart className="h-3.5 w-3.5 md:h-5 md:w-5 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-sm font-medium text-slate-600 truncate">Trades</p>
                <p className="text-sm md:text-xl font-bold text-slate-900">
                  {allHistory.filter((h) => h.category === "trade").length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-2 md:p-4" hover={false}>
            <div className="flex items-center gap-1.5 md:gap-3">
              <div className="h-7 w-7 md:h-10 md:w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <ArrowDownToLine className="h-3.5 w-3.5 md:h-5 md:w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-sm font-medium text-slate-600 truncate">Deposits</p>
                <p className="text-sm md:text-xl font-bold text-slate-900">
                  {allHistory.filter((h) => h.category === "deposit").length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-2 md:p-4" hover={false}>
            <div className="flex items-center gap-1.5 md:gap-3">
              <div className="h-7 w-7 md:h-10 md:w-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <ArrowUpFromLine className="h-3.5 w-3.5 md:h-5 md:w-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-sm font-medium text-slate-600 truncate">Withdrawals</p>
                <p className="text-sm md:text-xl font-bold text-slate-900">
                  {allHistory.filter((h) => h.category === "withdrawal").length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-3 md:p-6" hover={false}>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Filter className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
            <h2 className="text-sm md:text-lg font-semibold text-slate-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1.5 md:mb-2">Category</label>
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value as HistoryFilter)}
                className="w-full rounded-lg md:rounded-xl border border-slate-300 px-2 md:px-3 py-1.5 md:py-2.5 text-xs md:text-sm text-slate-900 focus:border-[#004B5B] focus:outline-none focus:ring-2 focus:ring-[#004B5B]/20"
              >
                <option value="all">All</option>
                <option value="trades">Trades Only</option>
                <option value="deposits">Deposits Only</option>
                <option value="withdrawals">Withdrawals Only</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1.5 md:mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full rounded-lg md:rounded-xl border border-slate-300 px-2 md:px-3 py-1.5 md:py-2.5 text-xs md:text-sm text-slate-900 focus:border-[#004B5B] focus:outline-none focus:ring-2 focus:ring-[#004B5B]/20"
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1.5 md:mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ID or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 md:pl-10 pr-2 md:pr-3 py-1.5 md:py-2.5 rounded-lg md:rounded-xl border border-slate-300 text-xs md:text-sm focus:border-[#004B5B] focus:outline-none focus:ring-2 focus:ring-[#004B5B]/20"
                />
              </div>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1.5 md:mb-2">From</label>
              <div className="relative">
                <Calendar className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-8 md:pl-10 pr-2 md:pr-3 py-1.5 md:py-2.5 rounded-lg md:rounded-xl border border-slate-300 text-xs md:text-sm focus:border-[#004B5B] focus:outline-none focus:ring-2 focus:ring-[#004B5B]/20"
                />
              </div>
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1.5 md:mb-2">To</label>
              <div className="relative">
                <Calendar className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-8 md:pl-10 pr-2 md:pr-3 py-1.5 md:py-2.5 rounded-lg md:rounded-xl border border-slate-300 text-xs md:text-sm focus:border-[#004B5B] focus:outline-none focus:ring-2 focus:ring-[#004B5B]/20"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Count */}
          {(historyFilter !== "all" || statusFilter !== "all" || searchQuery || dateFrom || dateTo) && (
            <div className="mt-3 md:mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-xs md:text-sm text-slate-600">
                Showing {filteredHistory.length} of {allHistory.length} transactions
              </p>
              <button
                onClick={() => {
                  setHistoryFilter("all");
                  setStatusFilter("all");
                  setSearchQuery("");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="text-xs md:text-sm font-medium text-[#004B5B] hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </Card>

        {/* History Table */}
        <Card className="p-3 md:p-6 overflow-hidden" hover={false}>
          <div className="overflow-x-auto -mx-3 md:mx-0">
            <div className="inline-block min-w-full align-middle px-3 md:px-0">
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 md:py-3 px-1.5 md:px-2 text-xs md:text-sm font-semibold text-slate-700">ID</th>
                      <th className="text-left py-2 md:py-3 px-1.5 md:px-2 text-xs md:text-sm font-semibold text-slate-700">Type</th>
                      <th className="text-left py-2 md:py-3 px-1.5 md:px-2 text-xs md:text-sm font-semibold text-slate-700 hidden lg:table-cell">Description</th>
                      <th className="text-right py-2 md:py-3 px-1.5 md:px-2 text-xs md:text-sm font-semibold text-slate-700">Amount</th>
                      <th className="text-left py-2 md:py-3 px-1.5 md:px-2 text-xs md:text-sm font-semibold text-slate-700">Status</th>
                      <th className="text-left py-2 md:py-3 px-1.5 md:px-2 text-xs md:text-sm font-semibold text-slate-700 hidden md:table-cell">Date</th>
                      <th className="text-center py-2 md:py-3 px-1.5 md:px-2 text-xs md:text-sm font-semibold text-slate-700 hidden sm:table-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <History className="h-10 w-10 md:h-12 md:w-12 text-slate-300" />
                            <p className="text-sm md:text-base text-slate-500">No transactions found</p>
                            <p className="text-xs md:text-sm text-slate-400">Try adjusting your filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-2 md:py-4 px-1.5 md:px-2 text-xs md:text-base font-medium text-slate-900">{item.id}</td>
                          <td className="py-2 md:py-4 px-1.5 md:px-2">
                            <div className={`inline-flex items-center gap-1 md:gap-2 px-1.5 md:px-3 py-0.5 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold ${getTypeColor(item.category, item.type)}`}>
                              <span className="hidden sm:inline">{getTypeIcon(item.category, item.type)}</span>
                              <span className="capitalize">{item.type}</span>
                            </div>
                          </td>
                          <td className="py-2 md:py-4 px-1.5 md:px-2 hidden lg:table-cell">
                            <p className="text-sm md:text-base text-slate-900">{item.description}</p>
                            {item.security && (
                              <p className="text-xs md:text-sm text-slate-500">
                                {item.quantity} shares @ Rwf {item.price}
                              </p>
                            )}
                          </td>
                          <td className={`text-right py-2 md:py-4 px-1.5 md:px-2 text-xs md:text-base font-semibold whitespace-nowrap ${
                            item.type === "deposit" || item.type === "sell"
                              ? "text-emerald-600"
                              : "text-slate-900"
                          }`}>
                            {item.type === "deposit" || item.type === "sell" ? "+" : ""}
                            Rwf {item.amount.toLocaleString()}
                          </td>
                          <td className="py-2 md:py-4 px-1.5 md:px-2">
                            <div className={`inline-flex items-center gap-1 md:gap-2 px-1.5 md:px-3 py-0.5 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold ${getStatusColor(item.status)}`}>
                              <span className="hidden sm:inline">{getStatusIcon(item.status)}</span>
                              <span className="capitalize">{item.status}</span>
                            </div>
                          </td>
                          <td className="py-2 md:py-4 px-1.5 md:px-2 text-xs md:text-sm text-slate-600 whitespace-nowrap hidden md:table-cell">{item.date}</td>
                          <td className="py-2 md:py-4 px-1.5 md:px-2 text-center hidden sm:table-cell">
                            <Button size="sm" variant="outline" className="text-[10px] md:text-xs px-2 md:px-3 py-1">
                              View
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination placeholder */}
          {filteredHistory.length > 0 && (
            <div className="mt-4 md:mt-6 flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-200 pt-4 gap-3">
              <p className="text-xs md:text-sm text-slate-600">
                Showing 1-{filteredHistory.length} of {filteredHistory.length} transactions
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled className="text-xs md:text-sm">
                  Previous
                </Button>
                <Button size="sm" variant="outline" disabled className="text-xs md:text-sm">
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
