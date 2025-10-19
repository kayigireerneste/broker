"use client";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function AuditorDashboard() {
  return (
    <DashboardLayout userRole="auditor" userName="Auditor Manager">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="animate-fadeInUp">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Auditor Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor investments, analyze Investmentss, and generate compliance
            reports.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideInRight">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total AUM</p>
                <p className="text-2xl font-bold text-gray-900">$12.8M</p>
                <p className="text-sm text-green-600">+3.2% this quarter</p>
              </div>
              <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Investmentss
                </p>
                <p className="text-2xl font-bold text-gray-900">2,847</p>
                <p className="text-sm text-blue-600">Under management</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg. Investments Return
                </p>
                <p className="text-2xl font-bold text-green-600">+8.4%</p>
                <p className="text-sm text-green-600">YTD performance</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Alerts</p>
                <p className="text-2xl font-bold text-orange-600">5</p>
                <p className="text-sm text-orange-600">Requires attention</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Investments Performance Analysis */}
          <div className="lg:col-span-2">
            <Card className="p-6 animate-fadeInUp">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Investments Performance Analysis
                </h2>
                <div className="flex space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Investmentss</option>
                    <option>High Risk</option>
                    <option>Medium Risk</option>
                    <option>Low Risk</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>YTD</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Client
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Investments Value
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        30D Return
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Risk Level
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
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
                      <td className="py-3 px-4">$24,580</td>
                      <td className="py-3 px-4 text-green-600">+5.2%</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          Medium
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Healthy
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">Jane Smith</p>
                          <p className="text-sm text-gray-600">ID: #12346</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">$87,420</td>
                      <td className="py-3 px-4 text-green-600">+12.8%</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          High
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                          Watch
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">Mike Johnson</p>
                          <p className="text-sm text-gray-600">ID: #12347</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">$156,890</td>
                      <td className="py-3 px-4 text-green-600">+3.7%</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Low
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Healthy
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">Sarah Wilson</p>
                          <p className="text-sm text-gray-600">ID: #12348</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">$43,210</td>
                      <td className="py-3 px-4 text-red-600">-2.1%</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          Medium
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          Alert
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Reports & Analytics */}
          <div className="space-y-6">
            <Card className="p-6 animate-slideInRight">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Generate Reports
              </h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Investments Summary
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  Performance Analysis
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Risk Assessment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Compliance Report
                </Button>
              </div>
            </Card>

            <Card
              className="p-6 animate-slideInRight"
              style={{ animationDelay: "0.1s" }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Market Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">RSE Index</span>
                  <span className="text-green-600 font-semibold">+1.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Top Performer</span>
                  <span className="font-medium">BK Group</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Market Cap</span>
                  <span className="font-medium">$2.8B</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Volume Today</span>
                  <span className="font-medium">$2.4M</span>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 animate-slideInRight"
              style={{ animationDelay: "0.2s" }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Risk Alerts
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <p className="font-medium text-sm text-red-800">
                    High Concentration
                  </p>
                  <p className="text-xs text-red-700">
                    Client #12346 - 80% in single stock
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                  <p className="font-medium text-sm text-orange-800">
                    Volatility Alert
                  </p>
                  <p className="text-xs text-orange-700">
                    Investments #12348 - High volatility detected
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <p className="font-medium text-sm text-yellow-800">
                    Performance Lag
                  </p>
                  <p className="text-xs text-yellow-700">
                    5 Investmentss underperforming benchmark
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Transaction Monitoring */}
        <Card className="p-6 animate-fadeInUp">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Recent Transactions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Time
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Client
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Transaction
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Broker
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">10:30 AM</td>
                  <td className="py-3 px-4">John Doe</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      BUY BK Group
                    </span>
                  </td>
                  <td className="py-3 px-4">$4,275</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Executed
                    </span>
                  </td>
                  <td className="py-3 px-4">Sarah J.</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">10:15 AM</td>
                  <td className="py-3 px-4">Jane Smith</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      SELL Equity Bank
                    </span>
                  </td>
                  <td className="py-3 px-4">$1,057</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Executed
                    </span>
                  </td>
                  <td className="py-3 px-4">Mike R.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">09:45 AM</td>
                  <td className="py-3 px-4">Alex Brown</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      Wallet Deposit
                    </span>
                  </td>
                  <td className="py-3 px-4">$5,000</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Completed
                    </span>
                  </td>
                  <td className="py-3 px-4">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
