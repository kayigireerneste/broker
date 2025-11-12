"use client";

import { useState, type ChangeEvent } from "react";
import SettingsLayout, { type SettingsLayoutNavItem } from "@/components/ui/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { Activity, ShieldCheck, Network } from "lucide-react";

const navItems: SettingsLayoutNavItem[] = [
  {
    id: "platform",
    label: "Platform controls",
    description: "Tune global preferences for all workspaces",
    icon: <Network className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "security",
    label: "Security",
    description: "Set authentication and access rules",
    icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "monitoring",
    label: "Monitoring",
    description: "Choose what we track and how alerts trigger",
    icon: <Activity className="h-4 w-4" aria-hidden="true" />,
  },
];

type PlatformForm = {
  primaryContact: string;
  supportEmail: string;
  maintenanceWindow: string;
};

type SecurityForm = {
  enforceMfa: boolean;
  sessionTimeout: number;
  allowApiAccess: boolean;
};

type MonitoringForm = {
  rpo: string;
  rto: string;
  notifyChannels: Record<string, boolean>;
};

export default function SuperAdminSettingsPage() {
  const [activeSection, setActiveSection] = useState<string>(navItems[0]?.id ?? "platform");
  const [platformForm, setPlatformForm] = useState<PlatformForm>({
    primaryContact: "",
    supportEmail: "",
    maintenanceWindow: "Sunday 02:00 - 04:00 CAT",
  });
  const [securityForm, setSecurityForm] = useState<SecurityForm>({
    enforceMfa: true,
    sessionTimeout: 30,
    allowApiAccess: true,
  });
  const [monitoringForm, setMonitoringForm] = useState<MonitoringForm>({
    rpo: "15 minutes",
    rto: "1 hour",
    notifyChannels: {
      Email: true,
      SMS: false,
      PagerDuty: true,
      Slack: true,
    },
  });

  const handlePlatformChange = (field: keyof PlatformForm) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setPlatformForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSecurityToggle = (field: keyof SecurityForm) => () => {
    if (field === "sessionTimeout") return;
    setSecurityForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSessionTimeoutChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10);
    if (Number.isNaN(value)) {
      setSecurityForm((prev) => ({ ...prev, sessionTimeout: 30 }));
      return;
    }
    setSecurityForm((prev) => ({ ...prev, sessionTimeout: Math.max(5, value) }));
  };

  const toggleChannel = (channel: string) => {
    setMonitoringForm((prev) => ({
      ...prev,
      notifyChannels: {
        ...prev.notifyChannels,
        [channel]: !prev.notifyChannels[channel],
      },
    }));
  };

  const renderPlatform = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Platform wide defaults</h2>
      <p className="mt-1 text-base text-slate-600">Set the baseline configuration all entities inherit unless overridden.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <InputField
          name="primaryContact"
          label="Primary contact"
          type="text"
          placeholder="Name"
          value={platformForm.primaryContact}
          onChange={handlePlatformChange("primaryContact")}
        />
        <InputField
          name="supportEmail"
          label="Support email"
          type="email"
          placeholder="support@example.com"
          value={platformForm.supportEmail}
          onChange={handlePlatformChange("supportEmail")}
        />
        <InputField
          name="maintenanceWindow"
          label="Maintenance window"
          type="text"
          placeholder="Schedule"
          value={platformForm.maintenanceWindow}
          onChange={handlePlatformChange("maintenanceWindow")}
        />
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline">Preview communication</Button>
        <Button>Publish defaults</Button>
      </div>
    </Card>
  );

  const renderSecurity = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Security posture</h2>
      <p className="mt-1 text-base text-slate-600">Apply consistent controls across all dashboards and service accounts.</p>
      <div className="mt-6 space-y-4 text-base text-slate-600">
        <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
          <span>Enforce multi-factor authentication</span>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            checked={securityForm.enforceMfa}
            onChange={handleSecurityToggle("enforceMfa")}
          />
        </label>
        <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
          <span>Allow API access</span>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            checked={securityForm.allowApiAccess}
            onChange={handleSecurityToggle("allowApiAccess")}
          />
        </label>
        <div className="rounded-2xl border border-slate-200 px-4 py-3">
          <span className="block text-base font-medium text-slate-700">Session timeout (minutes)</span>
          <input
            type="number"
            min={5}
            className="mt-2 w-32 rounded-full border border-slate-200 px-4 py-2 text-base text-slate-700 focus:border-[#004B5B] focus:outline-none"
            value={securityForm.sessionTimeout}
            onChange={handleSessionTimeoutChange}
          />
        </div>
      </div>
    </Card>
  );

  const renderMonitoring = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Monitoring & alerts</h2>
      <p className="mt-1 text-base text-slate-600">Track uptime and data objectives while keeping execs informed.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <InputField
          name="rpo"
          label="Recovery point objective"
          type="text"
          placeholder="e.g. 15 minutes"
          value={monitoringForm.rpo}
          onChange={(event) =>
            setMonitoringForm((prev) => ({ ...prev, rpo: event.target.value }))
          }
        />
        <InputField
          name="rto"
          label="Recovery time objective"
          type="text"
          placeholder="e.g. 1 hour"
          value={monitoringForm.rto}
          onChange={(event) =>
            setMonitoringForm((prev) => ({ ...prev, rto: event.target.value }))
          }
        />
      </div>
      <div className="mt-6 space-y-3 text-base text-slate-600">
        {Object.keys(monitoringForm.notifyChannels).map((channel) => (
          <label key={channel} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
            <span>{channel}</span>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              checked={monitoringForm.notifyChannels[channel]}
              onChange={() => toggleChannel(channel)}
            />
          </label>
        ))}
      </div>
    </Card>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "platform":
        return renderPlatform();
      case "security":
        return renderSecurity();
      case "monitoring":
        return renderMonitoring();
      default:
        return null;
    }
  };

  return (
    <SettingsLayout
      title="Super admin settings"
      description="Configure platform-wide defaults, tighten security controls, and monitor operational health."
      navItems={navItems}
      activeItem={activeSection}
      onItemSelect={setActiveSection}
      actions={<Button size="sm">Save changes</Button>}
      userRole="super-admin"
    >
      {renderContent()}
    </SettingsLayout>
  );
}
