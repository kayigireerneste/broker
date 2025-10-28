"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, UserPlus, Search, Eye } from "lucide-react";
import DashboardLayout from "@/components/ui/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Broker" | "Auditor" | "Client";
  status: "Active" | "Inactive";
}

const allUsers: User[] = [
  { id: 1, name: "John Doe", email: "john@admin.com", role: "Admin", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@broker.com", role: "Broker", status: "Active" },
  { id: 3, name: "Paul Ryan", email: "paul@auditor.com", role: "Auditor", status: "Inactive" },
  { id: 4, name: "Alice Johnson", email: "alice@client.com", role: "Client", status: "Active" },
  { id: 5, name: "Mark Lee", email: "mark@broker.com", role: "Broker", status: "Inactive" },
  { id: 6, name: "Grace Kim", email: "grace@client.com", role: "Client", status: "Active" },
  { id: 7, name: "Michael Adams", email: "mike@auditor.com", role: "Auditor", status: "Active" },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "All" || user.role === roleFilter;
      const matchStatus = statusFilter === "All" || user.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [search, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePrevious = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <DashboardLayout userRole="admin" userName="Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <h1 className="text-2xl font-semibold text-[#004B5B]">Manage Users</h1>
          <Button className="flex items-center gap-2 px-4 py-2 bg-[#004B5B] text-white hover:bg-[#006B85] rounded-full">
            <UserPlus className="h-4 w-4" /> Add User
          </Button>
        </div>

        {/* Filters & Search */}
        <Card className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-4 flex-wrap justify-center w-full md:w-auto">
            <select
              className="border border-[#004B5B]/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#004B5B]"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Broker">Broker</option>
              <option value="Auditor">Auditor</option>
              <option value="Client">Client</option>
            </select>

            <select
              className="border border-[#004B5B]/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#004B5B]"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Animated Search Input */}
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-3 text-gray-500 h-4 w-4" />
            <motion.input
              whileFocus={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200 }}
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-full pl-9 pr-3 py-2 text-[#004B5B] bg-transparent outline-none border border-[#004B5B]/50 focus:border-[#004B5B]"
            />
          </div>
        </Card>

        {/* Table */}
        <Card className="p-4 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#004B5B]/10 text-[#004B5B] uppercase text-xs">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-3 flex justify-center gap-3">
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-800"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * rowsPerPage + 1}–
              {Math.min(currentPage * rowsPerPage, filteredUsers.length)} of{" "}
              {filteredUsers.length}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={currentPage === 1 ? undefined : handlePrevious}
                className={`px-3 py-1 rounded-full text-white ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-[#004B5B]"}`}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={currentPage === totalPages ? undefined : handleNext}
                className={`px-3 py-1 rounded-full text-white ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-[#004B5B]"}`}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
