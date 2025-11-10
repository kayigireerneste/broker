"use client";

import { useMemo, useState } from "react";
import SettingsLayout, { type SettingsLayoutNavItem } from "@/components/ui/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { useAuth } from "@/hooks/useAuth";
import { Bell, CreditCard, Lock, User } from "lucide-react";

const navItems: SettingsLayoutNavItem[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Update your personal details",
    icon: <User className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "security",
    label: "Security",
    description: "Manage login and verification",
    icon: <Lock className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Choose how we keep you in the loop",
    icon: <Bell className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "billing",
    label: "Billing",
    description: "Control payment methods & limits",
    icon: <CreditCard className="h-4 w-4" aria-hidden="true" />,
  },
];

export default function ClientSettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>(navItems[0]?.id ?? "profile");
  const [profileForm, setProfileForm] = useState({
    phone: "",
    language: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const displayUser = useMemo(() => {
    const first = (user?.firstName as string | undefined) ?? "";
    const last = (user?.lastName as string | undefined) ?? "";
    const fullName = `${first} ${last}`.trim();
    return {
      name: fullName || user?.email?.split("@")[0] || "Client",
      email: user?.email ?? "Not provided",
    };
  }, [user?.email, user?.firstName, user?.lastName]);

  const renderProfile = () => (
    <Card className="p-6" hover={false}>
      <div className="flex flex-col gap-6">
        <header>
          <h2 className="text-xl font-semibold text-[#004B5B]">Personal details</h2>
          <p className="mt-1 text-sm text-slate-500">
            Keep your contact information up to date so we can reach you quickly.
          </p>
        </header>
        <div className="grid gap-5 md:grid-cols-2">
          <InputField
            name="fullName"
            label="Full name"
            type="text"
            value={displayUser.name}
            onChange={() => {}}
            disabled
          />
          <InputField
            name="email"
            label="Email address"
            type="email"
            value={displayUser.email}
            onChange={() => {}}
            disabled
          />
          <InputField
            name="phone"
            label="Phone number"
            type="tel"
            placeholder="Add phone"
            value={profileForm.phone}
            onChange={(event) =>
              setProfileForm((prev) => ({ ...prev, phone: event.target.value }))
            }
          />
          <InputField
            name="language"
            label="Preferred language"
            type="text"
            placeholder="English"
            value={profileForm.language}
            onChange={(event) =>
              setProfileForm((prev) => ({ ...prev, language: event.target.value }))
            }
          />
        </div>
        <div className="flex justify-end">
          <Button variant="outline">Update profile</Button>
        </div>
      </div>
    </Card>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <Card className="p-6" hover={false}>
        <h2 className="text-xl font-semibold text-[#004B5B]">Password</h2>
        <p className="mt-1 text-sm text-slate-500">
          Use a strong password that you don&apos;t use elsewhere to keep your account secure.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InputField
            name="currentPassword"
            label="Current password"
            type="password"
            placeholder="••••••••"
            value={passwordForm.currentPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
            }
            showVisibilityToggle
          />
          <InputField
            name="newPassword"
            label="New password"
            type="password"
            placeholder="Create a new password"
            value={passwordForm.newPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
            }
            showVisibilityToggle
          />
          <InputField
            name="confirmPassword"
            label="Confirm new password"
            type="password"
            placeholder="Repeat new password"
            value={passwordForm.confirmPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
            }
            showVisibilityToggle
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button>Change password</Button>
        </div>
      </Card>
      <Card className="p-6" hover={false}>
        <h2 className="text-xl font-semibold text-[#004B5B]">Two-factor authentication</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add an extra layer of protection by requiring a one-time code when signing in.
        </p>
        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
          <label className="flex items-center gap-3">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
            Email verification codes
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
            SMS verification when available
          </label>
        </div>
      </Card>
    </div>
  );

  const renderNotifications = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Notification preferences</h2>
      <p className="mt-1 text-sm text-slate-500">
        Decide how you want to receive alerts about portfolio activity.
      </p>
      <div className="mt-6 space-y-4 text-sm text-slate-600">
        {[
          {
            title: "Trade confirmations",
            body: "Get notified whenever an order closes or fails.",
          },
          {
            title: "Daily digest",
            body: "Receive a summary of performance and important events.",
          },
          {
            title: "Market alerts",
            body: "Track price movements for assets you follow.",
          },
        ].map((item) => (
          <label key={item.title} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300" />
            <span>
              <span className="block text-base font-medium text-slate-800">{item.title}</span>
              <span className="text-sm text-slate-500">{item.body}</span>
            </span>
          </label>
        ))}
      </div>
    </Card>
  );

  const renderBilling = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Billing & funding</h2>
      <p className="mt-1 text-sm text-slate-500">
        View and manage the cards and bank accounts you use to fund trades.
      </p>
      <div className="mt-4 space-y-4 text-sm text-slate-600">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-slate-800">Visa •••• 2480</p>
              <p className="text-xs text-slate-500">Primary funding method</p>
            </div>
            <Button variant="outline" size="sm">Set default</Button>
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">
          <p className="font-medium text-slate-700">Add a new payment method</p>
          <p className="mt-1 text-xs text-slate-500">Securely connect cards or mobile money wallets.</p>
          <div className="mt-4 flex justify-center">
            <Button size="sm">Add method</Button>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return renderProfile();
      case "security":
        return renderSecurity();
      case "notifications":
        return renderNotifications();
      case "billing":
        return renderBilling();
      default:
        return null;
    }
  };

  return (
    <SettingsLayout
      title="Account settings"
      description="Adjust your personal information, security options, and trading preferences."
      navItems={navItems}
      activeItem={activeSection}
      onItemSelect={setActiveSection}
      actions={<Button size="sm">Save all changes</Button>}
    >
      {renderContent()}
    </SettingsLayout>
  );
}
