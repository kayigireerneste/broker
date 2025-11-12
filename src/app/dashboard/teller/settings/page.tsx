"use client";

import { useEffect, useMemo, useState } from "react";
import SettingsLayout, { type SettingsLayoutNavItem } from "@/components/ui/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { useAuth } from "@/hooks/useAuth";
import { BellRing, Briefcase, ClipboardCheck, Users } from "lucide-react";

const navItems: SettingsLayoutNavItem[] = [
  {
    id: "firm-profile",
    label: "Firm profile",
    description: "Showcase your teller firm information",
    icon: <Briefcase className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "client-management",
    label: "Client management",
    description: "Control client onboarding and permissions",
    icon: <Users className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "compliance",
    label: "Compliance",
    description: "Stay aligned with regulatory needs",
    icon: <ClipboardCheck className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "alerts",
    label: "Alerts",
    description: "Configure trading and risk alerts",
    icon: <BellRing className="h-4 w-4" aria-hidden="true" />,
  },
];

export default function TellerSettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>(navItems[0]?.id ?? "firm-profile");

  const firmName = useMemo<string>(() => {
    const fallback = (user?.company as string) || "Your firm";
    const full = (user?.fullName as string | undefined)?.trim();
    return full ? `${full} Capital` : fallback;
  }, [user?.company, user?.fullName]);

  type FirmProfileForm = {
    firmName: string;
    website: string;
    primaryContact: string;
    supportEmail: string;
    officeLocation: string;
  };

  const [firmProfile, setFirmProfile] = useState<FirmProfileForm>({
    firmName: firmName,
    website: "",
    primaryContact: "",
    supportEmail: "",
    officeLocation: "",
  });

  useEffect(() => {
    setFirmProfile((prev) => ({ ...prev, firmName }));
  }, [firmName]);

  const renderFirmProfile = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Firm profile</h2>
      <p className="mt-1 text-base text-slate-600">Update how prospects and regulators see your firm on the platform.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <InputField
          name="firmName"
          label="Firm name"
          type="text"
          placeholder="Firm name"
          value={firmProfile.firmName}
          onChange={(event) => setFirmProfile((prev) => ({ ...prev, firmName: event.target.value }))}
        />
        <InputField name="website" label="Website" type="url" placeholder="https://" value={firmProfile.website} onChange={(event) => setFirmProfile((prev) => ({ ...prev, website: event.target.value }))} />
        <InputField name="primaryContact" label="Primary contact" type="text" placeholder="Contact name" value={firmProfile.primaryContact} onChange={(event) => setFirmProfile((prev) => ({ ...prev, primaryContact: event.target.value }))} />
        <InputField name="supportEmail" label="Support email" type="email" placeholder="support@example.com" value={firmProfile.supportEmail} onChange={(event) => setFirmProfile((prev) => ({ ...prev, supportEmail: event.target.value }))} />
        <div className="md:col-span-2">
          <InputField name="officeLocation" label="Office location" type="text" placeholder="City, Country" value={firmProfile.officeLocation} onChange={(event) => setFirmProfile((prev) => ({ ...prev, officeLocation: event.target.value }))} />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline">Preview page</Button>
        <Button>Publish changes</Button>
      </div>
    </Card>
  );

  const renderClientManagement = () => (
    <div className="space-y-6">
      <Card className="p-6" hover={false}>
        <h2 className="text-xl font-semibold text-[#004B5B]">Onboarding workflow</h2>
        <p className="mt-1 text-base text-slate-600">Define the documents and approvals required before activating a client account.</p>
        <div className="mt-4 space-y-3">
          {[
            "KYC verification",
            "Proof of funds",
            "Risk tolerance questionnaire",
            "Manager review",
          ].map((step) => (
            <label key={step} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300" defaultChecked />
              <span className="text-base text-slate-600">{step}</span>
            </label>
          ))}
        </div>
      </Card>
      <Card className="p-6" hover={false}>
        <h2 className="text-xl font-semibold text-[#004B5B]">Client permissions</h2>
        <p className="mt-1 text-base text-slate-600">Tailor who can trade independently or requires your approval first.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-base font-semibold text-slate-700">Self-directed clients</p>
            <p className="mt-2 text-sm text-slate-500">Trading automatically up to assigned limits.</p>
            <Button size="sm" className="mt-3">Configure limits</Button>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-base font-semibold text-slate-700">Advised clients</p>
            <p className="mt-2 text-sm text-slate-500">Orders held until a teller approves the instruction.</p>
            <Button size="sm" className="mt-3" variant="outline">Adjust workflow</Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderCompliance = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Compliance controls</h2>
      <p className="mt-1 text-base text-slate-600">Ensure trading activity stays within legal and internal policy thresholds.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="text-base font-semibold text-slate-800">Trade surveillance</h3>
          <p className="mt-1 text-sm text-slate-500">Flag trades that breach risk controls or concentration limits.</p>
          <div className="mt-3 flex gap-2 text-sm text-slate-600">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
              Insider watchlist
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked readOnly />
              Market manipulation alerts
            </label>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="text-base font-semibold text-slate-800">Reporting cadence</h3>
          <p className="mt-1 text-sm text-slate-500">Automate regulatory filings and internal sign-offs.</p>
          <select className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-base text-slate-700 focus:border-[#004B5B] focus:outline-none">
            <option>Weekly summary</option>
            <option>Monthly full report</option>
            <option>Quarterly audit pack</option>
          </select>
        </div>
      </div>
    </Card>
  );

  const renderAlerts = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Trading & risk alerts</h2>
      <p className="mt-1 text-base text-slate-600">Choose when our platform should notify you about market or account events.</p>
      <div className="mt-6 space-y-3 text-base text-slate-600">
        {["Large order execution", "Margin utilisation above 70%", "Client escalation required", "Regulatory notice updates"].map((alert) => (
          <label key={alert} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
            <span>{alert}</span>
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" defaultChecked />
          </label>
        ))}
      </div>
    </Card>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "firm-profile":
        return renderFirmProfile();
      case "client-management":
        return renderClientManagement();
      case "compliance":
        return renderCompliance();
      case "alerts":
        return renderAlerts();
      default:
        return null;
    }
  };

  return (
    <SettingsLayout
      title="Teller settings"
      description="Fine-tune how your firm operates across client onboarding, compliance, and real-time alerts."
      navItems={navItems}
      activeItem={activeSection}
      onItemSelect={setActiveSection}
      actions={<Button size="sm">Save changes</Button>}
    >
      {renderContent()}
    </SettingsLayout>
  );
}
