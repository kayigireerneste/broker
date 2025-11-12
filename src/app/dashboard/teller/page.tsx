/* eslint-disable react/no-unescaped-entities */
"use client";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

export default function TellerDashboard() {
  const { user } = useAuth();

  const { displayName, email, dashboardRole } = useMemo((): {
    displayName: string;
    email: string;
    dashboardRole: "client" | "teller" | "admin";
  } => {
    const fullName = (user?.fullName as string | undefined)?.trim() ?? "";
    const fallbackName = user?.email ? user.email.split("@")[0] : "Teller";
    const role = user?.role?.toLowerCase();
    const normalizedRole: "client" | "teller" | "admin" =
      role === "client" || role === "teller" || role === "admin"
        ? (role as "client" | "teller" | "admin")
        : "teller";

    return {
      displayName: fullName || fallbackName,
      email: user?.email ?? "Not provided",
      dashboardRole: normalizedRole,
    };
  }, [user?.email, user?.fullName, user?.role]);

  return (
    <DashboardLayout userRole={dashboardRole} userName={displayName} userEmail={email}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="animate-fadeInUp">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teller Dashboard</h1>
          <p className="text-gray-600">Manage client mandates, monitor trades, and keep portfolios aligned.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideInRight">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-orange-600">12</p>
                <p className="text-sm text-gray-600">Awaiting execution</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Executed Today</p>
                <p className="text-2xl font-bold text-green-600">28</p>
                <p className="text-sm text-green-600">+15% from yesterday</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trade Volume</p>
                <p className="text-2xl font-bold text-gray-900">$485K</p>
                <p className="text-sm text-blue-600">Today's volume</p>
              </div>
              <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
                <p className="text-sm text-gray-600">Total managed</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending Orders */}
          <div className="lg:col-span-2">
            <Card className="p-6 animate-fadeInUp">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Pending Orders</h2>
                <Button size="sm">View All</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Order</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">John Doe</p>
                          <p className="text-sm text-gray-600">ID: #12345</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">BUY BK Group</span>
                      </td>
                      <td className="py-3 px-4">50</td>
                      <td className="py-3 px-4">$85.50</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" className="px-3 py-1">Execute</Button>
                          <Button size="sm" variant="outline" className="px-3 py-1">Reject</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">Jane Smith</p>
                          <p className="text-sm text-gray-600">ID: #12346</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">SELL Equity Bank</span>
                      </td>
                      <td className="py-3 px-4">25</td>
                      <td className="py-3 px-4">$42.30</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" className="px-3 py-1">Execute</Button>
                          <Button size="sm" variant="outline" className="px-3 py-1">Reject</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">Mike Johnson</p>
                          <p className="text-sm text-gray-600">ID: #12347</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">BUY MTN Rwanda</span>
                      </td>
                      <td className="py-3 px-4">100</td>
                      <td className="py-3 px-4">$28.75</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" className="px-3 py-1">Execute</Button>
                          <Button size="sm" variant="outline" className="px-3 py-1">Reject</Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Market Status & Quick Actions */}
          <div className="space-y-6">
            <Card className="p-6 animate-slideInRight">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">RSE Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Open</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trading Hours</span>
                  <span className="text-sm font-medium">9:00 - 15:00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Update</span>
                  <span className="text-sm font-medium">2 min ago</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Market Status & Quick Actions */}
          <div className="space-y-6">
            <Card className="p-6 animate-slideInRight">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Status</h3>
              <div className="space-y-4">{/* ...unchanged... */}</div>
            </Card>

            {/* FIX: removed inline `style` because Card doesn’t accept it */}
            <Card className="p-6 animate-slideInRight delay-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Batch Execute
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5z" />
                  </svg>
                  Sync with RSE
                </Button>
              </div>
            </Card>

            <Card className="p-6 animate-slideInRight" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Executions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">BK Group - Buy</p>
                    <p className="text-xs text-gray-600">John D. - 50 shares</p>
                  </div>
                  <span className="text-green-600 font-semibold text-sm">Executed</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Equity Bank - Sell</p>
                    <p className="text-xs text-gray-600">Sarah M. - 30 shares</p>
                  </div>
                  <span className="text-blue-600 font-semibold text-sm">Executed</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">MTN Rwanda - Buy</p>
                    <p className="text-xs text-gray-600">Alex K. - 75 shares</p>
                  </div>
                  <span className="text-red-600 font-semibold text-sm">Rejected</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
