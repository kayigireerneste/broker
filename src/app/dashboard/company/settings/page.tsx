"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import SettingsLayout, { type SettingsLayoutNavItem } from "@/components/ui/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { Building2, Megaphone, ShieldCheck } from "lucide-react";

const navItems: SettingsLayoutNavItem[] = [
  {
    id: "profile",
    label: "Company profile",
    description: "Keep your public listing information current",
    icon: <Building2 className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "investor-relations",
    label: "Investor relations",
    description: "Manage disclosures and contact channels",
    icon: <Megaphone className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "governance",
    label: "Governance",
    description: "Control compliance and approval workflows",
    icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
  },
];

type ProfileForm = {
  legalName: string;
  sector: string;
  website: string;
  description: string;
};

type InvestorRelationsForm = {
  primaryContact: string;
  contactEmail: string;
  contactPhone: string;
  disclosurePortal: string;
  subscriptions: Record<string, boolean>;
};

type GovernanceForm = {
  complianceLead: string;
  complianceEmail: string;
  boardSecretary: string;
  esgLead: string;
};

export default function CompanySettingsPage() {
  const [activeSection, setActiveSection] = useState<string>(navItems[0]?.id ?? "profile");

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    legalName: "",
    sector: "",
    website: "",
    description: "",
  });

  const [investorRelationsForm, setInvestorRelationsForm] = useState<InvestorRelationsForm>({
    primaryContact: "",
    contactEmail: "",
    contactPhone: "",
    disclosurePortal: "",
    subscriptions: {
      "Earnings releases": true,
      "Corporate actions": true,
      "AGM reminders": true,
    },
  });

  const [governanceForm, setGovernanceForm] = useState<GovernanceForm>({
    complianceLead: "",
    complianceEmail: "",
    boardSecretary: "",
    esgLead: "",
  });

  const subscriptionItems = useMemo(() => Object.keys(investorRelationsForm.subscriptions), [investorRelationsForm.subscriptions]);

  const handleProfileChange = (field: keyof ProfileForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleInvestorRelationsChange = (field: keyof Omit<InvestorRelationsForm, "subscriptions">) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setInvestorRelationsForm((prev) => ({ ...prev, [field]: value }));
    };

  const toggleSubscription = (key: string) => {
    setInvestorRelationsForm((prev) => ({
      ...prev,
      subscriptions: {
        ...prev.subscriptions,
        [key]: !prev.subscriptions[key],
      },
    }));
  };

  const handleGovernanceChange = (field: keyof GovernanceForm) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setGovernanceForm((prev) => ({ ...prev, [field]: value }));
  };

  const renderProfile = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Public profile</h2>
      <p className="mt-1 text-base text-slate-600">Update what stakeholders see on the market portal.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <InputField
          name="legalName"
          label="Legal name"
          type="text"
          placeholder="Company legal name"
          value={profileForm.legalName}
          onChange={handleProfileChange("legalName")}
        />
        <InputField
          name="sector"
          label="Sector"
          type="text"
          placeholder="Industry"
          value={profileForm.sector}
          onChange={handleProfileChange("sector")}
        />
        <InputField
          name="website"
          label="Website"
          type="url"
          placeholder="https://"
          value={profileForm.website}
          onChange={handleProfileChange("website")}
        />
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-600">Short description</label>
          <textarea
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-700 focus:border-[#004B5B] focus:outline-none"
            rows={4}
            placeholder="Tell investors about your business"
            value={profileForm.description}
            onChange={handleProfileChange("description")}
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline">Discard</Button>
        <Button>Save changes</Button>
      </div>
    </Card>
  );

  const renderInvestorRelations = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Investor relations</h2>
      <p className="mt-1 text-base text-slate-600">Coordinate earnings releases, AGM notices, and investor support.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <InputField
          name="primaryContact"
          label="Primary contact"
          type="text"
          placeholder="Name"
          value={investorRelationsForm.primaryContact}
          onChange={handleInvestorRelationsChange("primaryContact")}
        />
        <InputField
          name="contactEmail"
          label="Contact email"
          type="email"
          placeholder="ir@example.com"
          value={investorRelationsForm.contactEmail}
          onChange={handleInvestorRelationsChange("contactEmail")}
        />
        <InputField
          name="contactPhone"
          label="Contact phone"
          type="text"
          placeholder="+250 7XX XXX XXX"
          value={investorRelationsForm.contactPhone}
          onChange={handleInvestorRelationsChange("contactPhone")}
        />
        <InputField
          name="disclosurePortal"
          label="Disclosure portal"
          type="text"
          placeholder="Share link to your docs"
          value={investorRelationsForm.disclosurePortal}
          onChange={handleInvestorRelationsChange("disclosurePortal")}
        />
      </div>
      <div className="mt-6 space-y-3 text-base text-slate-600">
        {subscriptionItems.map((item) => (
          <label key={item} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
            <span>{item}</span>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              checked={investorRelationsForm.subscriptions[item] ?? false}
              onChange={() => toggleSubscription(item)}
            />
          </label>
        ))}
      </div>
    </Card>
  );

  const renderGovernance = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Governance & compliance</h2>
      <p className="mt-1 text-base text-slate-600">Outline approval workflows and designate your compliance contacts.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <InputField
          name="complianceLead"
          label="Compliance lead"
          type="text"
          placeholder="Name"
          value={governanceForm.complianceLead}
          onChange={handleGovernanceChange("complianceLead")}
        />
        <InputField
          name="complianceEmail"
          label="Compliance email"
          type="email"
          placeholder="compliance@example.com"
          value={governanceForm.complianceEmail}
          onChange={handleGovernanceChange("complianceEmail")}
        />
        <InputField
          name="boardSecretary"
          label="Board secretary"
          type="text"
          placeholder="Name"
          value={governanceForm.boardSecretary}
          onChange={handleGovernanceChange("boardSecretary")}
        />
        <InputField
          name="esgLead"
          label="ESG contact"
          type="text"
          placeholder="Name"
          value={governanceForm.esgLead}
          onChange={handleGovernanceChange("esgLead")}
        />
      </div>
      <div className="mt-6 space-y-3">
        {["Financial statements", "Corporate governance report", "ESG updates"].map((item) => (
          <div key={item} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
            <span className="text-base text-slate-600">Require {item}</span>
            <Button size="sm" variant="outline">Manage</Button>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return renderProfile();
      case "investor-relations":
        return renderInvestorRelations();
      case "governance":
        return renderGovernance();
      default:
        return null;
    }
  };

  return (
    <SettingsLayout
      title="Company settings"
      description="Control what the market sees about your listed company and keep governance teams aligned."
      navItems={navItems}
      activeItem={activeSection}
      onItemSelect={setActiveSection}
      actions={<Button size="sm">Save all</Button>}
      userRole="company"
    >
      {renderContent()}
    </SettingsLayout>
  );
}
