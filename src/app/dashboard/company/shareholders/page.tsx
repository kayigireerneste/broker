"use client";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useMemo, useState } from "react";
import {
  FiSearch,
  FiDownload,
  FiUserPlus,
  FiMail,
  FiPhone,
} from "react-icons/fi";

export default function Shareholders() {
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

  const shareholders = [
    {
      id: 1,
      name: "John Doe Holdings",
      email: "john.doe@holdings.com",
      phone: "+250 788 123 456",
      shares: 12000,
      percentage: 10.0,
      joinDate: "2023-05-15",
      type: "institutional",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+250 788 234 567",
      shares: 5000,
      percentage: 4.17,
      joinDate: "2024-01-20",
      type: "individual",
    },
    {
      id: 3,
      name: "Investment Fund A",
      email: "contact@fundinvest.com",
      phone: "+250 788 345 678",
      shares: 15000,
      percentage: 12.5,
      joinDate: "2022-11-10",
      type: "institutional",
    },
    {
      id: 4,
      name: "Mike Johnson",
      email: "mike.j@email.com",
      phone: "+250 788 456 789",
      shares: 3500,
      percentage: 2.92,
      joinDate: "2024-06-05",
      type: "individual",
    },
  ];

  const stats = [
    { title: "Total Shareholders", value: "1,234" },
    { title: "Institutional", value: "145" },
    { title: "Individual", value: "1,089" },
    { title: "Total Shares Issued", value: "120,000" },
  ];

  const filteredShareholders = shareholders.filter((shareholder) => {
    const matchesSearch =
      shareholder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shareholder.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || shareholder.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout userRole={dashboardRole} userName={displayName} userEmail={email}>
      <div className="space-y-2">
        {/* Header */}
        <div className="animate-fadeInUp space-y-2">
          <h1 className="text-2xl font-bold text-gray-600">Shareholders</h1>
          <p className="text-base text-gray-400">
            Manage and view all shareholders, their holdings, and contact information.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 animate-slideInRight">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all">
              <p className="text-base font-medium text-gray-500 mb-2">{stat.title}</p>
              <p className="text-xl font-semibold text-gray-700">{stat.value}</p>
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
                placeholder="Search by name or email..."
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
              <option value="institutional">Institutional</option>
              <option value="individual">Individual</option>
            </select>
            <Button className="flex items-center gap-2">
              <FiUserPlus className="w-4 h-4" />
              Add Shareholder
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FiDownload className="w-4 h-4" />
              Export
            </Button>
          </div>
        </Card>

        {/* Shareholders Table */}
        <Card className="p-6 animate-fadeInUp">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Shareholder</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Shares Owned</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ownership %</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Join Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShareholders.map((shareholder) => (
                  <tr key={shareholder.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">{shareholder.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiMail className="w-4 h-4" />
                          {shareholder.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiPhone className="w-4 h-4" />
                          {shareholder.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">{shareholder.shares.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">{shareholder.percentage}%</p>
                    </td>
                    <td className="py-3 px-4">
                      {shareholder.type === "institutional" ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          Institutional
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          Individual
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">
                        {new Date(shareholder.joinDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredShareholders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No shareholders found matching your criteria.</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
