"use client";

import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: "client" | "broker" | "admin" | "auditor";
  userName: string;
}

export default function DashboardLayout({
  children,
  userRole,
  userName,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getNavItems = () => {
    switch (userRole) {
      case "client":
        return [
          { name: "Dashboard", icon: "📊", href: "/dashboard/client" },
          {
            name: "Investments",
            icon: "💼",
            href: "/dashboard/client/Investments",
          },
          { name: "Trade", icon: "📈", href: "/dashboard/client/trade" },
          { name: "Wallet", icon: "💳", href: "/dashboard/client/wallet" },
          { name: "History", icon: "📋", href: "/dashboard/client/history" },
          { name: "Settings", icon: "⚙️", href: "/dashboard/client/settings" },
        ];
      case "broker":
        return [
          { name: "Dashboard", icon: "📊", href: "/dashboard/broker" },
          { name: "Orders", icon: "📋", href: "/dashboard/broker/orders" },
          {
            name: "Executions",
            icon: "⚡",
            href: "/dashboard/broker/executions",
          },
          { name: "Clients", icon: "👥", href: "/dashboard/broker/clients" },
          { name: "Reports", icon: "📈", href: "/dashboard/broker/reports" },
        ];
      case "admin":
        return [
          { name: "Dashboard", icon: "📊", href: "/dashboard/admin" },
          { name: "Users", icon: "👥", href: "/dashboard/admin/users" },
          { name: "Brokers", icon: "🏢", href: "/dashboard/admin/brokers" },
          {
            name: "Transactions",
            icon: "💰",
            href: "/dashboard/admin/transactions",
          },
          { name: "Reports", icon: "📈", href: "/dashboard/admin/reports" },
          { name: "Settings", icon: "⚙️", href: "/dashboard/admin/settings" },
        ];
      case "auditor":
        return [
          { name: "Dashboard", icon: "📊", href: "/dashboard/auditor" },
          {
            name: "Investmentss",
            icon: "💼",
            href: "/dashboard/auditor/Investmentss",
          },
          {
            name: "Transactions",
            icon: "💰",
            href: "/dashboard/auditor/transactions",
          },
          { name: "Reports", icon: "📈", href: "/dashboard/auditor/reports" },
          {
            name: "Analytics",
            icon: "📊",
            href: "/dashboard/auditor/analytics",
          },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 gradient-primary transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#004F64] font-bold text-sm">MC</span>
            </div>
            <span className="text-white font-bold">Broker</span>
          </div>
        </div>

        <nav className="mt-8 px-4">
          {getNavItems().map((item, index) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 mb-2 animate-slideInRight"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </a>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/10 rounded-lg p-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="font-semibold">{userName.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium">{userName}</p>
                <p className="text-sm text-white/70 capitalize">{userRole}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM9 7H4l5-5v5z"
                  />
                </svg>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
