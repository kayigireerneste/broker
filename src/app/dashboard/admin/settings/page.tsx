"use client";

import { useEffect, useState } from "react";
import SettingsLayout, { type SettingsLayoutNavItem } from "@/components/ui/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { useAuth } from "@/hooks/useAuth";
import { Building2, Cable, CreditCard, ShieldCheck } from "lucide-react";

const navItems: SettingsLayoutNavItem[] = [
  {
    id: "organization",
    label: "Organization",
    description: "Manage global platform metadata",
    icon: <Building2 className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "roles",
    label: "Roles & access",
    description: "Control who can do what",
    icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "billing",
    label: "Billing",
    description: "Plans, usage & invoices",
    icon: <CreditCard className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "Connect external systems",
    icon: <Cable className="h-4 w-4" aria-hidden="true" />,
  },
];

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>(navItems[0]?.id ?? "organization");
  type OrganizationForm = {
    organisationName: string;
    supportEmail: string;
    primaryRegion: string;
    fiscalYearEnd: string;
  };

  const [organizationForm, setOrganizationForm] = useState<OrganizationForm>({
    organisationName:
      typeof user?.company === "string" && user.company.trim().length > 0
        ? user.company
  : "SunTech Agency",
    supportEmail: "",
    primaryRegion: "",
    fiscalYearEnd: "",
  });

  useEffect(() => {
    const company = user?.company;
    const organisationName =
      typeof company === "string" && company.trim().length > 0
        ? company
  : "SunTech Agency";
    setOrganizationForm((prev) => ({ ...prev, organisationName }));
  }, [user?.company]);

  const renderOrganization = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Platform identity</h2>
      <p className="mt-1 text-sm text-slate-500">
        Shape how your organisation appears to every workspace and partner.
      </p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <InputField
          name="organisationName"
          label="Organisation name"
          type="text"
          placeholder="Organisation name"
          value={organizationForm.organisationName}
          onChange={(event) =>
            setOrganizationForm((prev) => ({ ...prev, organisationName: event.target.value }))
          }
        />
        <InputField
          name="supportEmail"
          label="Support email"
          type="email"
          placeholder="support@example.com"
          value={organizationForm.supportEmail}
          onChange={(event) =>
            setOrganizationForm((prev) => ({ ...prev, supportEmail: event.target.value }))
          }
        />
        <InputField
          name="primaryRegion"
          label="Primary region"
          type="text"
          placeholder="Kigali, Rwanda"
          value={organizationForm.primaryRegion}
          onChange={(event) =>
            setOrganizationForm((prev) => ({ ...prev, primaryRegion: event.target.value }))
          }
        />
        <InputField
          name="fiscalYearEnd"
          label="Fiscal year end"
          type="text"
          placeholder="30 June"
          value={organizationForm.fiscalYearEnd}
          onChange={(event) =>
            setOrganizationForm((prev) => ({ ...prev, fiscalYearEnd: event.target.value }))
          }
        />
      </div>
      <div className="mt-6 flex justify-end">
        <Button>Update organisation</Button>
      </div>
    </Card>
  );

  const renderRoles = () => (
    <div className="space-y-6">
      <Card className="p-6" hover={false}>
        <h2 className="text-xl font-semibold text-[#004B5B]">Role templates</h2>
        <p className="mt-1 text-sm text-slate-500">
          Create predefined access levels so teams can start securely.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { name: "Administrator", desc: "Full access to system controls." },
            { name: "Agent manager", desc: "Manage agents & approvals." },
            { name: "Agent", desc: "Execute trades and support clients." },
          ].map((role) => (
            <div key={role.name} className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-800">{role.name}</p>
              <p className="mt-2 text-xs text-slate-500">{role.desc}</p>
              <Button size="sm" className="mt-4" variant="outline">
                Edit permissions
              </Button>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-6" hover={false}>
        <h2 className="text-xl font-semibold text-[#004B5B]">Session security</h2>
        <p className="mt-1 text-sm text-slate-500">Set policies for password rotation and device trust.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Password rotation</p>
            <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-[#004B5B] focus:outline-none">
              <option>Every 90 days</option>
              <option>Every 180 days</option>
              <option>No enforced rotation</option>
            </select>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Device trust</p>
            <label className="mt-2 flex items-center justify-between">
              <span>Require re-authentication every 30 days</span>
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300" defaultChecked />
            </label>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderBilling = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Plan & usage</h2>
      <p className="mt-1 text-sm text-slate-500">Review current subscription status and invoice history.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-700">Plan</p>
          <p className="mt-1 text-base font-bold text-[#004B5B]">Enterprise</p>
          <p className="text-xs text-slate-500">Unlimited dashboards & premium compliance tools.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-700">Active users</p>
          <p className="mt-1 text-base font-bold text-[#004B5B]">54 / 100</p>
          <p className="text-xs text-slate-500">Upgrade to lift the seat limit.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-700">Next invoice</p>
          <p className="mt-1 text-base font-bold text-[#004B5B]">$1,240</p>
          <p className="text-xs text-slate-500">Due 30 Nov 2025</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline">View invoices</Button>
        <Button>Manage plan</Button>
      </div>
    </Card>
  );

  const renderIntegrations = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Connected systems</h2>
      <p className="mt-1 text-sm text-slate-500">Link CRMs, compliance tools, and data warehouses for a unified workflow.</p>
      <div className="mt-6 space-y-4">
        {[
          { name: "Salesforce", status: "Active", description: "Sync client lifecycle events." },
          { name: "ComplyAdvantage", status: "Pending", description: "AML screening and watchlists." },
          { name: "Snowflake", status: "Active", description: "Data warehouse exports every hour." },
        ].map((integration) => (
          <div key={integration.name} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">{integration.name}</p>
              <p className="text-xs text-slate-500">{integration.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{integration.status}</span>
              <Button size="sm" variant="outline">Configure</Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <Button size="sm">Add integration</Button>
      </div>
    </Card>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "organization":
        return renderOrganization();
      case "roles":
        return renderRoles();
      case "billing":
        return renderBilling();
      case "integrations":
        return renderIntegrations();
      default:
        return null;
    }
  };

  return (
    <SettingsLayout
      title="Admin settings"
      description="Oversee organisation-wide controls, billing, and access across the platform."
      navItems={navItems}
      activeItem={activeSection}
      onItemSelect={setActiveSection}
      actions={<Button size="sm">Save admin updates</Button>}
    >
      {renderContent()}
    </SettingsLayout>
  );
}
