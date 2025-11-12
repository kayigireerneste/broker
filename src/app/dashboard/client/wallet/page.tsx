"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/ui/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { useAuth } from "@/hooks/useAuth";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, CreditCard, Smartphone, Building2, Clock } from "lucide-react";

type TransactionType = "deposit" | "withdraw";
type PaymentMethod = "card" | "mobile" | "bank";

export default function WalletPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TransactionType>("deposit");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

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

  const recentTransactions = [
    {
      id: "TXN001",
      type: "deposit",
      amount: 50000,
      method: "Mobile Money",
      status: "completed",
      date: "2025-11-12 10:30",
    },
    {
      id: "TXN002",
      type: "withdraw",
      amount: 15000,
      method: "Bank Transfer",
      status: "pending",
      date: "2025-11-11 16:45",
    },
    {
      id: "TXN003",
      type: "deposit",
      amount: 100000,
      method: "Credit Card",
      status: "completed",
      date: "2025-11-10 09:15",
    },
    {
      id: "TXN004",
      type: "withdraw",
      amount: 25000,
      method: "Bank Transfer",
      status: "completed",
      date: "2025-11-09 14:20",
    },
    {
      id: "TXN005",
      type: "deposit",
      amount: 75000,
      method: "Mobile Money",
      status: "completed",
      date: "2025-11-08 11:00",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Transaction:", { type: activeTab, amount, paymentMethod });
    setAmount("");
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

  return (
    <DashboardLayout userRole={dashboardRole} userName={displayName} userEmail={email}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wallet</h1>
          <p className="text-base text-slate-600 mt-1">Manage your funds and payment methods</p>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6" hover={false}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Available Balance</p>
                <p className="text-2xl font-bold text-slate-900">Rwf 3,420</p>
              </div>
            </div>
          </Card>

          <Card className="p-6" hover={false}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <ArrowDownToLine className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Deposited</p>
                <p className="text-2xl font-bold text-slate-900">Rwf 225,000</p>
              </div>
            </div>
          </Card>

          <Card className="p-6" hover={false}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <ArrowUpFromLine className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Withdrawn</p>
                <p className="text-2xl font-bold text-slate-900">Rwf 40,000</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction Form */}
          <Card className="p-6 lg:col-span-2" hover={false}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Manage Funds</h2>
              <p className="text-base text-slate-600 mt-1">Add or withdraw money from your wallet</p>
            </div>

            {/* Tab Toggle */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setActiveTab("deposit")}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "deposit"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <ArrowDownToLine className="h-5 w-5" />
                Deposit
              </button>
              <button
                onClick={() => setActiveTab("withdraw")}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "withdraw"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <ArrowUpFromLine className="h-5 w-5" />
                Withdraw
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Input */}
              <InputField
                name="amount"
                label={`${activeTab === "deposit" ? "Deposit" : "Withdrawal"} Amount (Rwf)`}
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  {activeTab === "deposit" ? "Payment Method" : "Withdrawal Method"}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === "card"
                        ? "border-[#004B5B] bg-[#004B5B]/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <CreditCard className={`h-6 w-6 ${paymentMethod === "card" ? "text-[#004B5B]" : "text-slate-400"}`} />
                    <span className={`text-sm font-semibold ${paymentMethod === "card" ? "text-[#004B5B]" : "text-slate-600"}`}>
                      Credit/Debit Card
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("mobile")}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === "mobile"
                        ? "border-[#004B5B] bg-[#004B5B]/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Smartphone className={`h-6 w-6 ${paymentMethod === "mobile" ? "text-[#004B5B]" : "text-slate-400"}`} />
                    <span className={`text-sm font-semibold ${paymentMethod === "mobile" ? "text-[#004B5B]" : "text-slate-600"}`}>
                      Mobile Money
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === "bank"
                        ? "border-[#004B5B] bg-[#004B5B]/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Building2 className={`h-6 w-6 ${paymentMethod === "bank" ? "text-[#004B5B]" : "text-slate-400"}`} />
                    <span className={`text-sm font-semibold ${paymentMethod === "bank" ? "text-[#004B5B]" : "text-slate-600"}`}>
                      Bank Transfer
                    </span>
                  </button>
                </div>
              </div>

              {/* Transaction Summary */}
              <div className="rounded-2xl bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between text-base">
                  <span className="text-slate-600">Amount</span>
                  <span className="font-semibold text-slate-900">Rwf {amount || "0"}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-slate-600">Fee</span>
                  <span className="font-semibold text-slate-900">Rwf 0</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between text-lg">
                  <span className="font-semibold text-slate-700">Total</span>
                  <span className="font-bold text-slate-900">Rwf {amount || "0"}</span>
                </div>
              </div>

              {/* Info Box */}
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex gap-3">
                <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Processing Time</p>
                  <p className="text-blue-700">
                    {activeTab === "deposit" 
                      ? "Deposits are typically processed within 5-10 minutes." 
                      : "Withdrawals may take 1-2 business days to process."}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className={`w-full ${
                  activeTab === "deposit" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-blue-500 hover:bg-blue-600"
                }`}
                disabled={!amount || Number.parseFloat(amount) < 1000}
              >
                {activeTab === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
              </Button>
            </form>
          </Card>

          {/* Saved Payment Methods */}
          <Card className="p-6" hover={false}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Payment Methods</h2>
              <p className="text-base text-slate-600 mt-1">Your saved methods</p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-slate-900">Visa •••• 2480</p>
                    <p className="text-sm text-slate-500">Expires 12/26</p>
                    <span className="inline-block mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      Primary
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <Smartphone className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-slate-900">MTN MoMo</p>
                    <p className="text-sm text-slate-500">+250 78X XXX 789</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-slate-900">Bank of Kigali</p>
                    <p className="text-sm text-slate-500">•••• 4521</p>
                  </div>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4">
              Add New Method
            </Button>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="p-6" hover={false}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Recent Transactions</h2>
              <p className="text-base text-slate-600 mt-1">Your latest wallet activity</p>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Transaction ID</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Type</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Method</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-slate-700">Amount</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-2 text-base font-medium text-slate-900">{txn.id}</td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2">
                        {txn.type === "deposit" ? (
                          <>
                            <ArrowDownToLine className="h-4 w-4 text-emerald-600" />
                            <span className="text-base text-slate-900 capitalize">{txn.type}</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpFromLine className="h-4 w-4 text-blue-600" />
                            <span className="text-base text-slate-900 capitalize">{txn.type}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-base text-slate-600">{txn.method}</td>
                    <td className={`text-right py-4 px-2 text-base font-semibold ${
                      txn.type === "deposit" ? "text-emerald-600" : "text-blue-600"
                    }`}>
                      {txn.type === "deposit" ? "+" : "-"}Rwf {txn.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(txn.status)}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-sm text-slate-600">{txn.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
