"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/ui/DashboardLayout";
import { CompanyCreateForm, CompanySummary } from "@/components/company/CompanyCreateForm";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function SuperAdminCompaniesPage() {
  const { user, token } = useAuth();
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/company")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setCompanies(Array.isArray(data?.data) ? data.data : []);
      })
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreated = (company: CompanySummary) => {
    setCompanies((prev) => [company, ...prev]);
  };

  const emailName = user?.email ? user.email.split("@")[0] : "";
  const displayName = (user?.fullName?.trim() || emailName || "Super Admin");

  return (
    <DashboardLayout userRole="super-admin" userName={displayName} userEmail={user?.email ?? ""}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-600">Companies</h1>
            <p className="text-sm text-gray-400">Create and manage company listings.</p>
          </div>
          <div>
            <Link href="/dashboard/super-admin/companies" className="hidden" />
            <Button variant="outline">
              <span className="mr-2">+</span> New company
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CompanyCreateForm authToken={token ?? null} onCreated={handleCreated} />
          </div>

          <div className="lg:col-span-2">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">All companies</h2>

              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-3">
                  {companies.length === 0 ? (
                    <p className="text-sm text-gray-500">No companies found</p>
                  ) : (
                    companies.map((c) => (
                      <div key={c.id} className="p-3 bg-white rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{c.name} {c.ticker ? `(${c.ticker})` : null}</p>
                            <p className="text-xs text-gray-500">{c.sector ?? "—"}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Closing: {c.closingPrice ?? "—"} • Change: {c.priceChange ?? "—"} • Volume: {c.tradedVolume ?? "—"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {c.snapshotDate ? (
                              <p className="text-xs text-gray-400">
                                {new Date(c.snapshotDate).toLocaleDateString()}
                              </p>
                            ) : null}
                            <Link href={`/dashboard/super-admin/companies/${c.id}`}>
                              <Button variant="outline">View</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
