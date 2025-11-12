"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import SettingsLayout, { type SettingsLayoutNavItem } from "@/components/ui/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { FileUploadField } from "@/components/ui/FileUploadField";
import OTPModal from "@/components/ui/OTPModal";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/axios";
import {
  GENDER_VALUES,
  validateProfileDetails,
  validatePhoneNumber,
} from "@/lib/validations/signupValidation";
import { getData } from "country-list";
import { CountryCode, getCountryCallingCode } from "libphonenumber-js";
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

const GENDER_LABELS: Record<(typeof GENDER_VALUES)[number], string> = {
  male: "Male",
  female: "Female",
};

const GENDER_OPTIONS = GENDER_VALUES.map((value) => ({ value, label: GENDER_LABELS[value] }));

const INVESTMENT_EXPERIENCE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "Select experience level" },
  { value: "beginner", label: "Beginner (0-1 years)" },
  { value: "intermediate", label: "Intermediate (1-5 years)" },
  { value: "experienced", label: "Experienced (5+ years)" },
];

const profileSettingsSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters"),
    phoneCountryCode: z
      .string()
      .trim()
      .regex(/^\+[0-9]{1,4}$/u, "Invalid country calling code"),
    phone: z.string().trim().min(4, "Phone number must contain digits"),
    gender: z
      .enum(GENDER_VALUES, {
        message: "Please select a gender",
      })
      .default("male"),
    country: z.string().trim().min(1, "Country is required"),
    city: z.string().trim().min(1, "City is required"),
    idNumber: z.string().trim().optional().or(z.literal("")),
    dateOfBirth: z.string().trim().optional().or(z.literal("")),
    occupation: z.string().trim().optional().or(z.literal("")),
    investmentExperience: z.string().trim().optional().or(z.literal("")),
    passportPhoto: z.string().trim().optional().or(z.literal("")),
    idDocument: z.string().trim().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    validatePhoneNumber(
      { phoneCountryCode: data.phoneCountryCode, phone: data.phone },
      ctx
    );

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
  notificationPreferences: unknown | null;
  isVerified: boolean;
};

type UserProfileResponse = { data: UserProfile; requiresEmailVerification?: boolean };

const createInitialProfileForm = (): ProfileFormState => ({
  fullName: "",
  phoneCountryCode: "+250",
  phone: "",
  gender: "male",
  country: "Rwanda",
  city: "",
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
  const [emailForm, setEmailForm] = useState<{ email: string }>({ email: "" });
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState<string>("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const persistUser = useCallback(
    (updated: UserProfile) => {
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
        isVerified: updated.isVerified,
        notificationPreferences: updated.notificationPreferences,
      } as Record<string, unknown>;

      try {
        localStorage.setItem("user", JSON.stringify(storedUser));
      } catch (storageError) {
        console.warn("Failed to sync updated user in storage", storageError);
      }

      refreshAuth();
    },
    [refreshAuth]
  );

  const countryData = useMemo(() => {
    return getData()
      .map(({ name, code }) => {
        try {
          const dialCode = getCountryCallingCode(code as CountryCode);
          return { name, code, dialCode: `+${dialCode}` };
        } catch {
          return { name, code, dialCode: "" };
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const phoneCountryOptions = useMemo(
    () =>
      countryData
        .filter((item) => item.dialCode)
        .map((item) => ({ value: item.dialCode, label: `${item.name} (${item.dialCode})` })),
    [countryData]
  );

  const countryOptions = useMemo(
    () => countryData.map((item) => ({ value: item.name, label: item.name })),
    [countryData]
  );

  useEffect(() => {
    const toStringOrEmpty = (value: unknown) => (typeof value === "string" ? value : "");
    const toPhoneCode = (value: unknown, fallback: string) =>
      typeof value === "string" && value.startsWith("+") ? value : fallback;
    const toDateInput = (value: unknown) => {
      if (typeof value !== "string") return "";
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return value;
      return parsed.toISOString().slice(0, 10);
    };
    const toGender = (value: unknown) => {
      if (typeof value === "string") {
        const lowered = value.toLowerCase();
        if ((GENDER_VALUES as readonly string[]).includes(lowered)) {
          return lowered as (typeof GENDER_VALUES)[number];
        }
      }
      return "male" as (typeof GENDER_VALUES)[number];
    };

    if (!user) {
      setProfileForm(createInitialProfileForm());
      setEmailForm({ email: "" });
      return;
    }

    setProfileForm((prev) => ({
      ...prev,
      fullName: toStringOrEmpty((user as Record<string, unknown>).fullName) || prev.fullName || "",
      phoneCountryCode: toPhoneCode((user as Record<string, unknown>).phoneCountryCode, prev.phoneCountryCode || "+250"),
      phone: toStringOrEmpty((user as Record<string, unknown>).phone),
      gender: toGender((user as Record<string, unknown>).gender),
      country: toStringOrEmpty((user as Record<string, unknown>).country) || prev.country || "",
      city: toStringOrEmpty((user as Record<string, unknown>).city),
      idNumber: toStringOrEmpty((user as Record<string, unknown>).idNumber),
      dateOfBirth: toDateInput((user as Record<string, unknown>).dateOfBirth),
      occupation: toStringOrEmpty((user as Record<string, unknown>).occupation),
      investmentExperience: toStringOrEmpty((user as Record<string, unknown>).investmentExperience),
      passportPhoto: toStringOrEmpty((user as Record<string, unknown>).passportPhoto),
      idDocument: toStringOrEmpty((user as Record<string, unknown>).idDocument),
    }));

    setEmailForm({ email: user.email ?? "" });
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    const needsHydration = !user.fullName || !(user as Record<string, unknown>).phone || !(user as Record<string, unknown>).country;
    if (!needsHydration) return;

    let cancelled = false;

    const hydrateProfile = async () => {
      try {
        const response = (await api.get(`/user/${user.id}`)) as UserProfileResponse;
        if (cancelled || !response?.data) return;
        persistUser(response.data);
      } catch (error) {
        console.error("Failed to hydrate user profile", error);
      }
    };

    hydrateProfile();

    return () => {
      cancelled = true;
    };
  }, [user, persistUser]);

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
    const payload: Record<string, unknown> = {
      fullName: data.fullName.trim(),
      gender: data.gender,
      country: data.country.trim(),
      city: data.city.trim(),
      phoneCountryCode: data.phoneCountryCode.trim(),
      phone: data.phone.trim(),
    };

    const trimOptional = (value?: string) => {
      const trimmed = value?.trim();
      return trimmed && trimmed.length > 0 ? trimmed : undefined;
    };

    const optionalStrings: Array<[keyof ProfileFormState, string | undefined]> = [
      ["idNumber", trimOptional(data.idNumber)],
      ["occupation", trimOptional(data.occupation)],
      ["investmentExperience", trimOptional(data.investmentExperience)],
      ["passportPhoto", trimOptional(data.passportPhoto)],
      ["idDocument", trimOptional(data.idDocument)],
    ];

    optionalStrings.forEach(([key, value]) => {
      if (value) {
        payload[key] = value;
      }
    });

    const dob = trimOptional(data.dateOfBirth);
    if (dob) {
      const parsed = new Date(dob);
      payload.dateOfBirth = Number.isNaN(parsed.getTime()) ? dob : parsed.toISOString();
    }

    setProfileStatus("saving");

    try {
      const response = (await api.patch(`/user/${user.id}`, payload)) as UserProfileResponse;
      const updated: UserProfile = response.data;

      setProfileForm((prev) => ({
        ...prev,
        fullName: updated.fullName ?? prev.fullName,
        phoneCountryCode: updated.phoneCountryCode ?? prev.phoneCountryCode,
        phone: updated.phone ?? prev.phone,
        gender:
          (updated.gender as (typeof GENDER_VALUES)[number]) ?? prev.gender,
        country: updated.country ?? prev.country,
        city: updated.city ?? prev.city,
        idNumber: updated.idNumber ?? "",
        dateOfBirth: updated.dateOfBirth
          ? new Date(updated.dateOfBirth).toISOString().slice(0, 10)
          : "",
        occupation: updated.occupation ?? "",
        investmentExperience: updated.investmentExperience ?? "",
        passportPhoto: updated.passportPhoto ?? "",
        idDocument: updated.idDocument ?? "",
      }));

      persistUser(updated);

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

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id) return;

    setEmailError(null);
    setEmailMessage(null);
    setEmailStatus("idle");

    const emailValue = emailForm.email.trim().toLowerCase();
    const emailValidation = z.string().trim().min(1, "Email is required").email("Invalid email format");
    const result = emailValidation.safeParse(emailValue);

    if (!result.success) {
      setEmailError(result.error.issues[0]?.message ?? "Invalid email");
      setEmailStatus("error");
      return;
    }

    if (emailValue === (user.email ?? "").toLowerCase()) {
      setEmailError("Enter a different email address to update");
      setEmailStatus("error");
      return;
    }

    setEmailStatus("saving");

    try {
      const response = (await api.patch(`/user/${user.id}`, {
        email: emailValue,
      })) as UserProfileResponse;

      const updated = response.data;
      setEmailForm({ email: updated.email });
      persistUser(updated);

      const requiresOtp = Boolean(response.requiresEmailVerification);
      setEmailStatus("success");
      setEmailMessage(
        requiresOtp
          ? "We sent a verification code to your new email. Enter it to finish updating your account."
          : "Email updated successfully."
      );

      if (requiresOtp) {
        setOtpEmail(updated.email);
        setShowOtpModal(true);
      }
    } catch (err) {
      const enrichedError = err as Error & {
        fieldErrors?: Array<{ field?: string; message: string }>;
      };

      if (Array.isArray(enrichedError.fieldErrors) && enrichedError.fieldErrors.length) {
        setEmailError(enrichedError.fieldErrors[0]?.message ?? "Please fix the highlighted field");
      } else {
        setEmailMessage(enrichedError.message || "Failed to update email.");
      }
      setEmailStatus("error");
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id) return;

    setPasswordMessage(null);
    setPasswordStatus("idle");

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      setPasswordStatus("error");
      setPasswordMessage("New password must be at least 8 characters long.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus("error");
      setPasswordMessage("Passwords do not match.");
      return;
    }

    setPasswordStatus("saving");

    try {
      const response = (await api.patch(`/user/${user.id}`, {
        password: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      })) as UserProfileResponse;

      persistUser(response.data);

      setPasswordStatus("success");
      setPasswordMessage("Password updated successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const enrichedError = err as Error & {
        fieldErrors?: Array<{ field?: string; message: string }>;
      };

      if (Array.isArray(enrichedError.fieldErrors) && enrichedError.fieldErrors.length) {
        setPasswordMessage(enrichedError.fieldErrors[0]?.message ?? "Please fix the highlighted fields.");
      } else {
        setPasswordMessage(enrichedError.message || "Failed to update password.");
      }
      setPasswordStatus("error");
    }
  };

  const handleOtpVerified = useCallback(async () => {
    if (!user?.id) {
      setShowOtpModal(false);
      return;
    }

    try {
      const response = (await api.get(`/user/${user.id}`)) as UserProfileResponse;
      if (response?.data) {
        const refreshed = response.data;
        setProfileForm((prev) => ({
          ...prev,
          fullName: refreshed.fullName ?? prev.fullName,
          phoneCountryCode: refreshed.phoneCountryCode ?? prev.phoneCountryCode,
          phone: refreshed.phone ?? prev.phone,
          gender:
            (refreshed.gender as (typeof GENDER_VALUES)[number]) ?? prev.gender,
          country: refreshed.country ?? prev.country,
          city: refreshed.city ?? prev.city,
          idNumber: refreshed.idNumber ?? "",
          dateOfBirth: refreshed.dateOfBirth
            ? new Date(refreshed.dateOfBirth).toISOString().slice(0, 10)
            : "",
          occupation: refreshed.occupation ?? "",
          investmentExperience: refreshed.investmentExperience ?? "",
          passportPhoto: refreshed.passportPhoto ?? "",
          idDocument: refreshed.idDocument ?? "",
        }));
        setEmailForm({ email: refreshed.email });
        persistUser(refreshed);
        setEmailStatus("success");
        setEmailMessage("Email verified successfully.");
      }
    } catch (error) {
      console.error("Failed to refresh user after email verification", error);
    } finally {
      setShowOtpModal(false);
    }
  }, [user?.id, persistUser]);

  const renderProfile = () => (
    <Card className="p-6" hover={false}>
      <form className="flex flex-col gap-6" onSubmit={handleProfileSubmit}>
        <header>
          <h2 className="text-xl font-semibold text-[#004B5B]">Personal details</h2>
          <p className="mt-1 text-base text-slate-600">
            Keep your contact information up to date and add any supporting documents required by our compliance team.
          </p>
        </header>

        {profileMessage && (
          <div
            className={`rounded-md border px-4 py-3 text-base ${
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
            placeholder="Enter your full name"
            value={profileForm.fullName ?? ""}
            onChange={handleProfileInputChange("fullName")}
            error={profileErrors.fullName}
          />
          <div className="flex flex-col gap-2">
            <label htmlFor="gender" className="text-sm font-medium text-[#004B5B]">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={profileForm.gender ?? "male"}
              onChange={handleProfileSelectChange("gender")}
              className={`w-full rounded-full px-4 py-2 text-[#004B5B] bg-transparent outline-none border transition-all ${
                profileErrors.gender
                  ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                  : "border-[#004B5B]/50 focus:border-[#004B5B] hover:border-[#004B5B]/80"
              }`}
            >
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="text-[#004B5B]">
                  {option.label}
                </option>
              ))}
            </select>
            {profileErrors.gender && <p className="text-sm text-red-500 ml-2">{profileErrors.gender}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="phoneCountryCode" className="text-sm font-medium text-[#004B5B]">
              Phone country code
            </label>
            <select
              id="phoneCountryCode"
              name="phoneCountryCode"
              value={profileForm.phoneCountryCode ?? ""}
              onChange={handleProfileSelectChange("phoneCountryCode")}
              className={`w-full rounded-full px-4 py-2 text-[#004B5B] bg-transparent outline-none border transition-all ${
                profileErrors.phoneCountryCode
                  ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                  : "border-[#004B5B]/50 focus:border-[#004B5B] hover:border-[#004B5B]/80"
              }`}
            >
              <option value="" disabled className="text-slate-400">
                Select code
              </option>
              {phoneCountryOptions.map((option) => (
                <option key={option.value} value={option.value} className="text-[#004B5B]">
                  {option.label}
                </option>
              ))}
            </select>
            {profileErrors.phoneCountryCode && (
              <p className="text-sm text-red-500 ml-2">{profileErrors.phoneCountryCode}</p>
            )}
          </div>
          <InputField
            name="phone"
            label="Phone number"
            type="tel"
            placeholder="Add phone"
            value={profileForm.phone ?? ""}
            onChange={handleProfileInputChange("phone")}
            error={profileErrors.phone}
          />
          <div className="flex flex-col gap-2">
            <label htmlFor="country" className="text-sm font-medium text-[#004B5B]">
              Country of residence
            </label>
            <select
              id="country"
              name="country"
              value={profileForm.country ?? ""}
              onChange={handleProfileSelectChange("country")}
              className={`w-full rounded-full px-4 py-2 text-[#004B5B] bg-transparent outline-none border transition-all ${
                profileErrors.country
                  ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                  : "border-[#004B5B]/50 focus:border-[#004B5B] hover:border-[#004B5B]/80"
              }`}
            >
              <option value="" disabled className="text-slate-400">
                Select country
              </option>
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value} className="text-[#004B5B]">
                  {option.label}
                </option>
              ))}
            </select>
            {profileErrors.country && <p className="text-sm text-red-500 ml-2">{profileErrors.country}</p>}
          </div>
          <InputField
            name="city"
            label="City"
            type="text"
            placeholder="Enter your city"
            value={profileForm.city ?? ""}
            onChange={handleProfileInputChange("city")}
            error={profileErrors.city}
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

        <div className="md:grid-cols-2">
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
        <h2 className="text-xl font-semibold text-[#004B5B]">Login &amp; security</h2>
        <p className="mt-1 text-base text-slate-600">
          Keep your email and password up to date so you never lose access to your account.
        </p>

        <div className="mt-6 space-y-8">
          <form className="space-y-4" onSubmit={handleEmailSubmit}>
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <InputField
                  name="email"
                  label="Email address"
                  type="email"
                  placeholder="Enter your new email"
                  value={emailForm.email}
                  onChange={(event) => {
                    const value = event.target.value;
                    setEmailForm({ email: value });
                    setEmailError(null);
                    setEmailMessage(null);
                    setEmailStatus("idle");
                  }}
                  error={emailError ?? undefined}
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                disabled={emailStatus === "saving"}
                className="md:min-w-44"
              >
                {emailStatus === "saving" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  "Update email"
                )}
              </Button>
            </div>

            {emailMessage && (
              <div
                className={`rounded-md border px-4 py-3 text-base ${
                  emailStatus === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {emailMessage}
              </div>
            )}
          </form>

          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                name="currentPassword"
                label="Current password"
                type="password"
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(event) => {
                  const value = event.target.value;
                  setPasswordForm((prev) => ({ ...prev, currentPassword: value }));
                  setPasswordStatus("idle");
                  setPasswordMessage(null);
                }}
                showVisibilityToggle
              />
              <InputField
                name="newPassword"
                label="New password"
                type="password"
                placeholder="Create a new password"
                value={passwordForm.newPassword}
                onChange={(event) => {
                  const value = event.target.value;
                  setPasswordForm((prev) => ({ ...prev, newPassword: value }));
                  setPasswordStatus("idle");
                  setPasswordMessage(null);
                }}
                showVisibilityToggle
              />
              <InputField
                name="confirmPassword"
                label="Confirm new password"
                type="password"
                placeholder="Repeat new password"
                value={passwordForm.confirmPassword}
                onChange={(event) => {
                  const value = event.target.value;
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: value }));
                  setPasswordStatus("idle");
                  setPasswordMessage(null);
                }}
                showVisibilityToggle
              />
            </div>

            {passwordMessage && (
              <div
                className={`rounded-md border px-4 py-3 text-base ${
                  passwordStatus === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {passwordMessage}
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={passwordStatus === "saving"} className="min-w-40">
                {passwordStatus === "saving" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  "Change password"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
      <Card className="p-6" hover={false}>
        <h2 className="text-xl font-semibold text-[#004B5B]">Two-factor authentication</h2>
        <p className="mt-1 text-base text-slate-600">
          Add an extra layer of protection by requiring a one-time code when signing in.
        </p>
        <div className="mt-4 flex flex-col gap-3 text-base text-slate-600">
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
      <p className="mt-1 text-base text-slate-600">
        Decide how you want to receive alerts about portfolio activity.
      </p>
      <div className="mt-6 space-y-4 text-base text-slate-600">
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
              <span className="text-base text-slate-600">{item.body}</span>
            </span>
          </label>
        ))}
      </div>
    </Card>
  );

  const renderBilling = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Billing & funding</h2>
      <p className="mt-1 text-base text-slate-600">
        View and manage the cards and bank accounts you use to fund trades.
      </p>
      <div className="mt-4 space-y-4 text-base text-slate-600">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-slate-800">Visa •••• 2480</p>
              <p className="text-sm text-slate-500">Primary funding method</p>
            </div>
            <Button variant="outline" size="sm">Set default</Button>
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">
          <p className="font-medium text-slate-700">Add a new payment method</p>
          <p className="mt-1 text-sm text-slate-500">Securely connect cards or mobile money wallets.</p>
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
    <>
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

      <OTPModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={otpEmail || emailForm.email}
        onVerified={async () => {
          await handleOtpVerified();
        }}
        buildSuccessMessage={() => "Email verified successfully."}
        successRedirect={null}
      />
    </>
  );
}
