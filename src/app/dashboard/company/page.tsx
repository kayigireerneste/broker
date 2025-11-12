"use client";

import { useMemo } from "react";
import DashboardLayout from "@/components/ui/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import {
  FiBriefcase,
  FiTrendingUp,
  FiClipboard,
  FiDollarSign,
  FiLayers,
  FiDownload,
} from "react-icons/fi";

export default function CompanyDashboard() {
  const { user } = useAuth();

  const { displayName, email, dashboardRole } = useMemo((): {
    displayName: string;
    email: string;
    dashboardRole: "company";
  } => {
    const fullName = (user?.fullName as string | undefined)?.trim() ?? "";
    const fallbackName = user?.email ? user.email.split("@")[0] : "Issuer";

    return {
      displayName: fullName || fallbackName,
      email: user?.email ?? "Not provided",
      dashboardRole: "company",
    };
  }, [user?.email, user?.fullName]);

  const portfolioHighlights = [
    {
      title: "Listed Shares",
      value: "24.5M",
      info: "Total outstanding",
      icon: <FiLayers className="w-6 h-6 text-white" />,
      gradient: "bg-gradient-to-r from-[#004B5B] to-[#007C92]",
    },
    {
      title: "Average Price",
      value: "Rwf 126",
      info: "Last 30 days",
      icon: <FiDollarSign className="w-6 h-6 text-yellow-400" />,
      accent: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Active Offers",
      value: "18",
      info: "Across two listings",
      icon: <FiTrendingUp className="w-6 h-6 text-green-400" />,
      accent: "bg-green-100 text-green-600",
    },
    {
      title: "Fulfilled Orders",
      value: "1,204",
      info: "This quarter",
      icon: <FiClipboard className="w-6 h-6 text-blue-400" />,
      accent: "bg-blue-100 text-blue-500",
    },
  ];

  const orderFeed = [
    {
      time: "2 minutes ago",
      type: "Buy",
      detail: "45,000 shares of SunTech PLC filled",
      amount: "Rwf 5.6M",
    },
    {
      time: "6 minutes ago",
      type: "Sell",
      detail: "14,500 shares of Horizon Energy matched",
      amount: "Rwf 1.9M",
    },
    {
      time: "12 minutes ago",
      type: "Buy",
      detail: "9,800 shares of Atlas Telecom executed",
      amount: "Rwf 1.2M",
    },
  ];

  return (
    <DashboardLayout userRole={dashboardRole} userName={displayName} userEmail={email}>
      <div className="space-y-6">
        <div className="space-y-2 animate-fadeInUp">
          <h1 className="text-2xl font-bold text-gray-600">Company Console</h1>
          <p className="text-base text-gray-400">
            Track listings, monitor investor activity, and publish new share offers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideInRight">
          {portfolioHighlights.map((card) => (
            <Card key={card.title} className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium text-gray-500 mb-5">{card.title}</p>
                  <p className="text-xl font-semibold text-gray-700">{card.value}</p>
                  <p className="text-sm text-gray-400">{card.info}</p>
                </div>
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center ${
                    card.gradient || card.accent || "bg-gray-100"
                  }`}
                >
                  {card.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2 animate-fadeInUp">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-500">Live Order Feed</h2>
              <Button variant="outline" className="text-sm">
                Manage offers
              </Button>
            </div>
            <div className="space-y-4">
              {orderFeed.map((order) => (
                <div
                  key={order.time + order.detail}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-600">{order.detail}</p>
                    <p className="text-xs text-gray-400">{order.time}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full bg-${
                        order.type === "Buy" ? "green" : "orange"
                      }-100 text-${order.type === "Buy" ? "green" : "orange"}-600`}
                    >
                      {order.type}
                    </span>
                    <p className="text-sm font-medium text-gray-600">{order.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 animate-slideInRight">
            <h3 className="text-lg font-semibold text-gray-600 mb-4">Listing Toolkit</h3>
            <div className="space-y-4">
              {["Publish new offer", "Update disclosure", "Download investor book"].map((action) => (
                <Button key={action} className="w-full justify-start" variant="outline">
                  <span className="mr-3 text-[#004B5B]">
                    {action === "Download investor book" ? <FiDownload /> : <FiBriefcase />}
                  </span>
                  <span className="text-sm font-semibold text-gray-600">{action}</span>
                </Button>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6 animate-fadeInUp">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-500">Performance Overview</h2>
            <Button variant="secondary" className="text-sm text-[#004B5B]">
              Export summary
            </Button>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: "Market Cap", value: "Rwf 3.4B", change: "+4.2%", color: "green" },
              { label: "Top Investor", value: "Axia Holdings", change: "12% ownership", color: "blue" },
              { label: "Dividend Yield", value: "3.8%", change: "Stable", color: "gray" },
              { label: "Upcoming Events", value: "Earnings call", change: "10 Feb", color: "orange" },
            ].map((metric) => (
              <div key={metric.label} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">{metric.label}</p>
                <p className="text-lg font-semibold text-gray-700">{metric.value}</p>
                <p className={`text-xs text-${metric.color}-600 font-medium`}>{metric.change}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
