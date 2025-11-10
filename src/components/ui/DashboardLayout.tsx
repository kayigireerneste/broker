"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  FiBarChart2,
  FiBriefcase,
  FiTrendingUp,
  FiCreditCard,
  FiClipboard,
  FiSettings,
  FiUsers,
  FiZap,
  FiDollarSign,
  FiHome,
  FiBell,
  FiMenu,
  FiHelpCircle,
  FiSearch,
  FiActivity,
} from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";

type DashboardRole = "client" | "teller" | "admin" | "super-admin" | "company";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: DashboardRole;
  userName?: string;
  userEmail?: string;
}

const toDashboardRole = (role?: string | null): DashboardRole => {
  const normalized = role?.toUpperCase().replace(/-/g, "_");

  switch (normalized) {
    case "CLIENT":
      return "client";
    case "TELLER":
      return "teller";
    case "ADMIN":
      return "admin";
    case "SUPER_ADMIN":
      return "super-admin";
    case "COMPANY":
      return "company";
    default:
      return "client";
  }
};

export default function DashboardLayout({
  children,
  userRole,
  userName,
  userEmail,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const redirectSuffix = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/auth/login${redirectSuffix}`);
    }
  }, [loading, isAuthenticated, pathname, router]);

  const derivedRole = useMemo(() => {
    if (userRole) return userRole;
    return toDashboardRole(user?.role);
  }, [userRole, user?.role]);

  const derivedName = useMemo(() => {
    if (userName) return userName;
    const fullName = (user?.fullName as string | undefined)?.trim();
    if (fullName) return fullName;
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  }, [userName, user?.fullName, user?.email]);

  const derivedEmail = useMemo(() => {
    if (userEmail) return userEmail;
    return user?.email ?? "";
  }, [userEmail, user?.email]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getNavItems = () => {
    switch (derivedRole) {
      case "client":
        return [
          { name: "Dashboard", icon: FiBarChart2, href: "/dashboard/client" },
          { name: "Investments", icon: FiBriefcase, href: "/dashboard/client/investments" },
          { name: "Trade", icon: FiTrendingUp, href: "/dashboard/client/trade" },
          { name: "Wallet", icon: FiCreditCard, href: "/dashboard/client/wallet" },
          { name: "History", icon: FiClipboard, href: "/dashboard/client/history" },
          { name: "Settings", icon: FiSettings, href: "/dashboard/client/settings" },
        ];
      case "teller":
        return [
          { name: "Dashboard", icon: FiBarChart2, href: "/dashboard/teller" },
          { name: "Orders", icon: FiClipboard, href: "/dashboard/teller/orders" },
          { name: "Executions", icon: FiZap, href: "/dashboard/teller/executions" },
          { name: "Clients", icon: FiUsers, href: "/dashboard/teller/clients" },
          { name: "Reports", icon: FiTrendingUp, href: "/dashboard/teller/reports" },
        ];
      case "admin":
        return [
          { name: "Dashboard", icon: FiBarChart2, href: "/dashboard/admin" },
          { name: "Users", icon: FiUsers, href: "/dashboard/admin/users" },
          { name: "Tellers", icon: FiHome, href: "/dashboard/admin/tellers" },
          { name: "Transactions", icon: FiDollarSign, href: "/dashboard/admin/transactions" },
          { name: "Reports", icon: FiTrendingUp, href: "/dashboard/admin/reports" },
          { name: "Settings", icon: FiSettings, href: "/dashboard/admin/settings" },
        ];
      case "super-admin":
        return [
          { name: "Overview", icon: FiBarChart2, href: "/dashboard/super-admin" },
          { name: "User Management", icon: FiUsers, href: "/dashboard/super-admin/users" },
          { name: "Companies", icon: FiBriefcase, href: "/dashboard/super-admin/companies" },
          { name: "System Health", icon: FiActivity, href: "/dashboard/super-admin/system" },
          { name: "Settings", icon: FiSettings, href: "/dashboard/super-admin/settings" },
        ];
      case "company":
        return [
          { name: "Dashboard", icon: FiBarChart2, href: "/dashboard/company" },
          { name: "Listings", icon: FiBriefcase, href: "/dashboard/company/listings" },
          { name: "Share Offers", icon: FiTrendingUp, href: "/dashboard/company/offers" },
          { name: "Orders", icon: FiClipboard, href: "/dashboard/company/orders" },
          { name: "Settings", icon: FiSettings, href: "/dashboard/company/settings" },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 gradient-primary transform transition-transform duration-300 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/20">
          <div className="flex items-center space-x-3 ml-2">
            <Link href="/">
                <Image
                src="/logo.svg"
                alt="App Logo"
                width={80}
                height={35}
                className="rounded-md bg-white p-1"
              />
            </Link>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white md:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="mt-8 px-4 overflow-y-auto h-[calc(100vh-10rem)]">
          {getNavItems().map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 mb-2"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="text-xl" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/10 rounded-lg p-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="font-semibold text-white">
                  {derivedName?.charAt(0) ?? "U"}
                </span>
              </div>
              <div>
                <p className="font-medium">{derivedName}</p>
                <p className="text-xs text-white/80 truncate">{derivedEmail || "Email unavailable"}</p>
                <p className="text-sm text-white/70 capitalize">{derivedRole}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 
        ${sidebarOpen ? "ml-0" : "md:ml-64"}`}
      >
        <header className="fixed top-0 z-40 bg-white shadow-sm border-b border-gray-200 w-full md:w-[calc(100%-16rem)] md:left-64">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
            >
              <FiMenu className="w-6 h-6" />
            </button>

            <div className="flex-1 max-w-xl mx-4 hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search here"
                  className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B5B] focus:border-transparent"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
                <FiBell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                <FiHelpCircle className="w-6 h-6" />
              </button>

              <select className="text-sm font-medium text-gray-600 border-none bg-transparent focus:outline-none cursor-pointer">
                <option>EN</option>
                <option>FR</option>
                <option>RW</option>
                <option>SW</option>
              </select>
            </div>
          </div>
        </header>

        <main className="pt-20 px-4 md:px-8 pb-8 flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
