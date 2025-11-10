"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import SettingsLayout, { type SettingsLayoutNavItem } from "@/components/ui/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { FileUploadField } from "@/components/ui/FileUploadField";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/axios";
import {
  profileDetailsSchema,
  validateProfileDetails,
  validatePhoneNumber,
} from "@/lib/validations/signupValidation";
import { Bell, CreditCard, Lock, User, Loader2 } from "lucide-react";
import { z } from "zod";

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

const INVESTMENT_EXPERIENCE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "Select experience level" },
  { value: "beginner", label: "Beginner (0-1 years)" },
  { value: "intermediate", label: "Intermediate (1-5 years)" },
  { value: "experienced", label: "Experienced (5+ years)" },
];

const profileSettingsSchema = profileDetailsSchema
  .extend({
    phoneCountryCode: z
      .string()
      .trim()
      .regex(/^\+[0-9]{1,4}$/u, "Invalid country calling code")
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .trim()
      .min(4, "Phone number must contain digits")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const code = data.phoneCountryCode?.trim();
    const phone = data.phone?.trim();

    if ((code && !phone) || (!code && phone)) {
      ctx.addIssue({
        path: code && !phone ? ["phone"] : ["phoneCountryCode"],
        code: z.ZodIssueCode.custom,
        message: "Phone number and country code must be provided together",
      });
    } else if (code && phone) {
      validatePhoneNumber({ phoneCountryCode: code, phone }, ctx);
    }

    validateProfileDetails(
      {
        idNumber: data.idNumber?.trim(),
        passportPhoto: data.passportPhoto?.trim(),
        idDocument: data.idDocument?.trim(),
        dateOfBirth: data.dateOfBirth?.trim(),
        occupation: data.occupation?.trim(),
        investmentExperience: data.investmentExperience?.trim(),
      },
      ctx
    );
  });

type ProfileFormState = z.input<typeof profileSettingsSchema>;

type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phoneCountryCode: string | null;
  phone: string | null;
  idNumber: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  country: string | null;
  city: string | null;
  occupation: string | null;
  investmentExperience: string | null;
  passportPhoto: string | null;
  idDocument: string | null;
};

type UserProfileResponse = { data: UserProfile };

const createInitialProfileForm = (): ProfileFormState => ({
  phoneCountryCode: "+250",
  phone: "",
  idNumber: "",
  dateOfBirth: "",
  occupation: "",
  investmentExperience: "",
  passportPhoto: "",
  idDocument: "",
});

export default function ClientSettingsPage() {
  const { user, refreshAuth } = useAuth();
  const [activeSection, setActiveSection] = useState<string>(navItems[0]?.id ?? "profile");
  const [profileForm, setProfileForm] = useState<ProfileFormState>(createInitialProfileForm());
  const [profileErrors, setProfileErrors] = useState<Partial<Record<keyof ProfileFormState, string>>>({});
  const [profileStatus, setProfileStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const displayUser = useMemo(() => {
    const fullName = (user?.fullName as string | undefined)?.trim();
    return {
      name: fullName || user?.email?.split("@")[0] || "Client",
      email: user?.email ?? "Not provided",
    };
  }, [user?.email, user?.fullName]);

  useEffect(() => {
    const toStringOrEmpty = (value: unknown) => (typeof value === "string" ? value : "");
    const toPhoneCode = (value: unknown) => (typeof value === "string" && value.startsWith("+") ? value : "");
    const toDateInput = (value: unknown) => {
      if (typeof value !== "string") return "";
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return value;
      return parsed.toISOString().slice(0, 10);
    };

    if (!user) {
      setProfileForm(createInitialProfileForm());
      return;
    }

    setProfileForm((prev) => ({
      ...prev,
      phoneCountryCode: toPhoneCode((user as Record<string, unknown>).phoneCountryCode) || prev.phoneCountryCode || "",
      phone: toStringOrEmpty((user as Record<string, unknown>).phone),
      idNumber: toStringOrEmpty((user as Record<string, unknown>).idNumber),
      dateOfBirth: toDateInput((user as Record<string, unknown>).dateOfBirth),
      occupation: toStringOrEmpty((user as Record<string, unknown>).occupation),
      investmentExperience: toStringOrEmpty((user as Record<string, unknown>).investmentExperience),
      passportPhoto: toStringOrEmpty((user as Record<string, unknown>).passportPhoto),
      idDocument: toStringOrEmpty((user as Record<string, unknown>).idDocument),
    }));
  }, [user]);

  const handleProfileInputChange = (field: keyof ProfileFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setProfileForm((prev) => ({ ...prev, [field]: value }));
      setProfileErrors((prev) => {
        if (!(field in prev)) return prev;
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
      setProfileStatus("idle");
      setProfileMessage(null);
    };

  const handleProfileSelectChange = (field: keyof ProfileFormState) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      setProfileForm((prev) => ({ ...prev, [field]: value }));
      setProfileErrors((prev) => {
        if (!(field in prev)) return prev;
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
      setProfileStatus("idle");
      setProfileMessage(null);
    };

  const handleProfileFileChange = (field: "passportPhoto" | "idDocument") => (value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
    setProfileErrors((prev) => {
      if (!(field in prev)) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
    setProfileStatus("idle");
    setProfileMessage(null);
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id) return;

    setProfileStatus("idle");
    setProfileMessage(null);

    const validation = profileSettingsSchema.safeParse(profileForm);

    if (!validation.success) {
      const flattened = validation.error.flatten();
      const fieldErrors = Object.entries(flattened.fieldErrors).reduce<
        Partial<Record<keyof ProfileFormState, string>>
      >((acc, [key, messages]) => {
        if (messages && messages[0]) {
          acc[key as keyof ProfileFormState] = messages[0];
        }
        return acc;
      }, {});

      setProfileErrors(fieldErrors);
      setProfileStatus("error");
      setProfileMessage(flattened.formErrors[0] ?? "Please fix the highlighted fields");
      return;
    }

  setProfileErrors({});

  const data = validation.data;
    const trimOrUndefined = (value?: string | null) => {
      const trimmed = value?.trim();
      return trimmed && trimmed.length > 0 ? trimmed : undefined;
    };

    const payload: Record<string, unknown> = {};

    const code = trimOrUndefined(data.phoneCountryCode ?? undefined);
    const phone = trimOrUndefined(data.phone ?? undefined);

    if (code && phone) {
      payload.phoneCountryCode = code;
      payload.phone = phone;
    }

    const optionalFields: Array<keyof ProfileFormState> = [
      "idNumber",
      "dateOfBirth",
      "occupation",
      "investmentExperience",
      "passportPhoto",
      "idDocument",
    ];

    optionalFields.forEach((field) => {
      const value = trimOrUndefined(data[field] as string | undefined);
      if (value) {
        payload[field] = value;
      }
    });

    if (Object.keys(payload).length === 0) {
      setProfileStatus("error");
      setProfileMessage("Nothing changed—update a field before saving.");
      return;
    }

    setProfileStatus("saving");

    try {
  const response = (await api.patch(`/user/${user.id}`, payload)) as UserProfileResponse;
  const updated: UserProfile = response.data;

      const safeDate = updated.dateOfBirth ? new Date(updated.dateOfBirth).toISOString().slice(0, 10) : "";

      setProfileForm((prev) => ({
        ...prev,
        phoneCountryCode: updated.phoneCountryCode ?? prev.phoneCountryCode ?? "",
        phone: updated.phone ?? "",
        idNumber: updated.idNumber ?? "",
        dateOfBirth: safeDate,
        occupation: updated.occupation ?? "",
        investmentExperience: updated.investmentExperience ?? "",
        passportPhoto: updated.passportPhoto ?? "",
        idDocument: updated.idDocument ?? "",
      }));

      const storedUser = {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        role: updated.role,
        phoneCountryCode: updated.phoneCountryCode,
        phone: updated.phone,
        idNumber: updated.idNumber,
        dateOfBirth: updated.dateOfBirth,
        occupation: updated.occupation,
        investmentExperience: updated.investmentExperience,
        passportPhoto: updated.passportPhoto,
        idDocument: updated.idDocument,
        country: updated.country,
        city: updated.city,
        gender: updated.gender,
      } as Record<string, unknown>;

      try {
        localStorage.setItem("user", JSON.stringify(storedUser));
      } catch (storageError) {
        console.warn("Failed to sync updated user in storage", storageError);
      }

      refreshAuth();

      setProfileErrors({});
      setProfileStatus("success");
      setProfileMessage("Profile details updated successfully.");
    } catch (err) {
      const enrichedError = err as Error & {
        fieldErrors?: Array<{ field?: string; message: string }>;
      };

      if (Array.isArray(enrichedError.fieldErrors) && enrichedError.fieldErrors.length) {
        const mapped = enrichedError.fieldErrors.reduce<
          Partial<Record<keyof ProfileFormState, string>>
        >((acc, issue) => {
          if (issue.field) {
            acc[issue.field as keyof ProfileFormState] = issue.message;
          }
          return acc;
        }, {});
        setProfileErrors(mapped);
        setProfileStatus("error");
        setProfileMessage("Please fix the highlighted fields and try again.");
      } else {
        const errorMessage = enrichedError.message || "Failed to update profile.";
        setProfileStatus("error");
        setProfileMessage(errorMessage);
      }
    }
  };

  const renderProfile = () => (
    <Card className="p-6" hover={false}>
      <form className="flex flex-col gap-6" onSubmit={handleProfileSubmit}>
        <header>
          <h2 className="text-xl font-semibold text-[#004B5B]">Personal details</h2>
          <p className="mt-1 text-sm text-slate-500">
            Keep your contact information up to date and add any supporting documents required by our compliance team.
          </p>
        </header>

        {profileMessage && (
          <div
            className={`rounded-md border px-4 py-3 text-sm ${
              profileStatus === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {profileMessage}
          </div>
        )}

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
            name="phoneCountryCode"
            label="Country code"
            type="text"
            placeholder="+250"
            value={profileForm.phoneCountryCode ?? ""}
            onChange={handleProfileInputChange("phoneCountryCode")}
            error={profileErrors.phoneCountryCode}
          />
          <InputField
            name="phone"
            label="Phone number"
            type="tel"
            placeholder="Add phone"
            value={profileForm.phone ?? ""}
            onChange={handleProfileInputChange("phone")}
            error={profileErrors.phone}
          />
          <InputField
            name="idNumber"
            label="National ID number"
            type="text"
            placeholder="Enter your ID number"
            value={profileForm.idNumber ?? ""}
            onChange={handleProfileInputChange("idNumber")}
            error={profileErrors.idNumber}
          />
          <InputField
            name="occupation"
            label="Occupation"
            type="text"
            placeholder="What do you do?"
            value={profileForm.occupation ?? ""}
            onChange={handleProfileInputChange("occupation")}
            error={profileErrors.occupation}
          />
          <InputField
            name="dateOfBirth"
            label="Date of birth"
            type="date"
            value={profileForm.dateOfBirth ?? ""}
            onChange={handleProfileInputChange("dateOfBirth")}
            error={profileErrors.dateOfBirth}
          />
          <div className="flex flex-col gap-2">
            <label htmlFor="investmentExperience" className="text-sm font-medium text-[#004B5B]">
              Investment experience
            </label>
            <select
              id="investmentExperience"
              name="investmentExperience"
              value={profileForm.investmentExperience ?? ""}
              onChange={handleProfileSelectChange("investmentExperience")}
              className={`w-full rounded-full px-4 py-2 text-[#004B5B] bg-transparent outline-none border transition-all ${
                profileErrors.investmentExperience
                  ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                  : "border-[#004B5B]/50 focus:border-[#004B5B] hover:border-[#004B5B]/80"
              }`}
            >
              {INVESTMENT_EXPERIENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="text-[#004B5B]">
                  {option.label}
                </option>
              ))}
            </select>
            {profileErrors.investmentExperience && (
              <p className="text-sm text-red-500 ml-2">{profileErrors.investmentExperience}</p>
            )}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FileUploadField
            name="passportPhoto"
            label="Passport photo"
            value={profileForm.passportPhoto ?? ""}
            onChange={handleProfileFileChange("passportPhoto")}
            error={profileErrors.passportPhoto}
            accept="image/*"
            helperText="Upload a clear passport-style photo (JPEG, PNG, WEBP)"
          />
          <FileUploadField
            name="idDocument"
            label="Identification document"
            value={profileForm.idDocument ?? ""}
            onChange={handleProfileFileChange("idDocument")}
            error={profileErrors.idDocument}
            accept="image/*,application/pdf"
            helperText="Provide a copy of your ID document (image or PDF)"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="outline"
            disabled={profileStatus === "saving"}
            className="min-w-40"
          >
            {profileStatus === "saving" ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Update profile"
            )}
          </Button>
        </div>
      </form>
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
