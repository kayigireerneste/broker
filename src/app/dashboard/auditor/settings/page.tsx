"use client";

import { useState } from "react";
import SettingsLayout, { type SettingsLayoutNavItem } from "@/components/ui/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { CalendarClock, ClipboardList, FileSpreadsheet, Mail } from "lucide-react";

const navItems: SettingsLayoutNavItem[] = [
  {
    id: "engagement",
    label: "Engagement scope",
    description: "Define audit timelines & visibility",
    icon: <CalendarClock className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "evidence",
    label: "Evidence",
    description: "Collect and manage supporting docs",
    icon: <ClipboardList className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "alerts",
    label: "Alerts",
    description: "Stay informed about key events",
    icon: <Mail className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "exports",
    label: "Exports",
    description: "Tailor regulatory reporting",
    icon: <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />,
  },
];

export default function AuditorSettingsPage() {
  const [activeSection, setActiveSection] = useState<string>(navItems[0]?.id ?? "engagement");
  const [engagementForm, setEngagementForm] = useState({
    auditTitle: "",
    leadAuditor: "",
    startDate: "",
    endDate: "",
  });

  const renderEngagement = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Audit engagement</h2>
      <p className="mt-1 text-sm text-slate-500">
        Configure the cadence, scope, and access controls for this audit workspace.
      </p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <InputField
          name="auditTitle"
          label="Audit title"
          type="text"
          placeholder="Q4 Regulatory Review"
          value={engagementForm.auditTitle}
          onChange={(event) =>
            setEngagementForm((prev) => ({ ...prev, auditTitle: event.target.value }))
          }
        />
        <InputField
          name="leadAuditor"
          label="Lead auditor"
          type="text"
          placeholder="Assign a lead"
          value={engagementForm.leadAuditor}
          onChange={(event) =>
            setEngagementForm((prev) => ({ ...prev, leadAuditor: event.target.value }))
          }
        />
        <InputField
          name="startDate"
          label="Start date"
          type="date"
          value={engagementForm.startDate}
          onChange={(event) =>
            setEngagementForm((prev) => ({ ...prev, startDate: event.target.value }))
          }
        />
        <InputField
          name="endDate"
          label="End date"
          type="date"
          value={engagementForm.endDate}
          onChange={(event) =>
            setEngagementForm((prev) => ({ ...prev, endDate: event.target.value }))
          }
        />
      </div>
      <div className="mt-6 flex justify-end">
        <Button>Save scope</Button>
      </div>
    </Card>
  );

  const renderEvidence = () => (
    <div className="space-y-6">
      <Card className="p-6" hover={false}>
        <h2 className="text-xl font-semibold text-[#004B5B]">Evidence collection</h2>
        <p className="mt-1 text-sm text-slate-500">Track outstanding requests and required deliverables.</p>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {[
            "Bank statements for Q4",
            "Trade blotter extracts",
            "Client suitability summaries",
            "Internal control attestations",
          ].map((item) => (
            <label key={item} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
              <span>{item}</span>
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
            </label>
          ))}
        </div>
      </Card>
      <Card className="p-6" hover={false}>
        <h2 className="text-xl font-semibold text-[#004B5B]">Reviewer assignments</h2>
        <p className="mt-1 text-sm text-slate-500">Assign team members to specific focus areas.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { name: "Transactions", reviewer: "Aimee" },
            { name: "Compliance", reviewer: "Eric" },
            { name: "Financials", reviewer: "Noella" },
          ].map((area) => (
            <div key={area.name} className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-800">{area.name}</p>
              <p className="mt-1 text-xs text-slate-500">{area.reviewer}</p>
              <Button size="sm" className="mt-3" variant="outline">Reassign</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderAlerts = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Notification settings</h2>
      <p className="mt-1 text-sm text-slate-500">Audit updates arrive exactly where you expect them.</p>
      <div className="mt-6 space-y-3 text-sm text-slate-600">
        {[
          "When evidence is uploaded",
          "Deadline approaching reminders",
          "Exception flagged by AI review",
          "Audit log export available",
        ].map((message) => (
          <label key={message} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" defaultChecked />
            <span>{message}</span>
          </label>
        ))}
      </div>
    </Card>
  );

  const renderExports = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Export formats</h2>
      <p className="mt-1 text-sm text-slate-500">Generate regulator-ready packs in the formats you need.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-800">Regulator exports</p>
          <p className="mt-1 text-xs text-slate-500">Select templates matching the jurisdiction.</p>
          <select className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-[#004B5B] focus:outline-none">
            <option>BNR format</option>
            <option>Capital markets authority</option>
            <option>Custom CSV layout</option>
          </select>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-800">Scheduling</p>
          <p className="mt-1 text-xs text-slate-500">Send reports automatically or keep them manual.</p>
          <label className="mt-3 flex items-center justify-between">
            <span>Auto-send every Friday</span>
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
          </label>
          <Button size="sm" className="mt-4" variant="outline">Configure webhook</Button>
        </div>
      </div>
    </Card>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "engagement":
        return renderEngagement();
      case "evidence":
        return renderEvidence();
      case "alerts":
        return renderAlerts();
      case "exports":
        return renderExports();
      default:
        return null;
    }
  };

  return (
    <SettingsLayout
      title="Auditor settings"
      description="Control the scope, notifications, and reporting automation for your audit engagements."
      navItems={navItems}
      activeItem={activeSection}
      onItemSelect={setActiveSection}
      actions={<Button size="sm">Save audit settings</Button>}
    >
      {renderContent()}
    </SettingsLayout>
  );
}
