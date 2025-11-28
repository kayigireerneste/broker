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
import { getData } from "country-list";
import { CountryCode, getCountryCallingCode } from "libphonenumber-js";
import { Building2, Lock, FileText, TrendingUp, Loader2 } from "lucide-react";
import { z } from "zod";

const navItems: SettingsLayoutNavItem[] = [
  {
    id: "company",
    label: "Company Profile",
    description: "Update company information",
    icon: <Building2 className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "market",
    label: "Market Data",
    description: "Manage share price and trading info",
    icon: <TrendingUp className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "documents",
    label: "Documents",
    description: "Upload company documents",
    icon: <FileText className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "security",
    label: "Security",
    description: "Manage login credentials",
    icon: <Lock className="h-4 w-4" aria-hidden="true" />,
  },
];

const SECTOR_OPTIONS = [
  { value: "", label: "Select sector" },
  { value: "Technology", label: "Technology" },
  { value: "Finance", label: "Finance" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Energy", label: "Energy" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Telecommunications", label: "Telecommunications" },
  { value: "Real Estate", label: "Real Estate" },
  { value: "Consumer Goods", label: "Consumer Goods" },
  { value: "Other", label: "Other" },
];

const companyProfileSchema = z.object({
  name: z.string().trim().min(2, "Company name must be at least 2 characters"),
  phoneCountryCode: z.string().trim().regex(/^\+[0-9]{1,4}$/u, "Invalid country code"),
  phone: z.string().trim().min(4, "Phone number required"),
  country: z.string().trim().min(1, "Country is required"),
  city: z.string().trim().min(1, "City is required"),
  sector: z.string().trim().optional().or(z.literal("")),
  sectorOther: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  symbol: z.string().trim().optional().or(z.literal("")),
});

const marketDataSchema = z.object({
  sharePrice: z.string().trim().optional().or(z.literal("")),
  totalShares: z.string().trim().optional().or(z.literal("")),
  availableShares: z.string().trim().optional().or(z.literal("")),
});

type CompanyProfileForm = z.input<typeof companyProfileSchema> & { email: string; csdNumber: string };
type MarketDataForm = z.input<typeof marketDataSchema>;

export default function CompanySettingsPage() {
  const { user, refreshAuth } = useAuth();
  const [activeSection, setActiveSection] = useState<string>(navItems[0]?.id ?? "company");
  const [companyForm, setCompanyForm] = useState<CompanyProfileForm>({
    name: "",
    email: "",
    phoneCountryCode: "+250",
    phone: "",
    country: "Rwanda",
    city: "",
    sector: "",
    sectorOther: "",
    description: "",
    symbol: "",
    csdNumber: "",
  });
  const [companyErrors, setCompanyErrors] = useState<Partial<Record<keyof CompanyProfileForm, string>>>({});
  const [companyStatus, setCompanyStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [companyMessage, setCompanyMessage] = useState<string | null>(null);

  const [marketForm, setMarketForm] = useState<MarketDataForm>({
    sharePrice: "",
    totalShares: "",
    availableShares: "",
  });
  const [marketReadOnly, setMarketReadOnly] = useState({
    closingPrice: "0.00",
    previousClosingPrice: "0.00",
    tradedVolume: "0",
    tradedValue: "0.00",
  });
  const [marketErrors, setMarketErrors] = useState<Partial<Record<keyof MarketDataForm, string>>>({});
  const [marketStatus, setMarketStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [marketMessage, setMarketMessage] = useState<string | null>(null);

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

  const [documents, setDocuments] = useState<string[]>([]);
  const [contract, setContract] = useState<string>("");

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
    const fetchCompanyData = async () => {
      if (!user?.id) return;
      try {
        const response = await api.get(`/company/${user.id}`);
        const data = response.data;
        
        setCompanyForm({
          name: data.name || "",
          email: data.email || "",
          phoneCountryCode: data.phoneCountryCode || "+250",
          phone: data.phone || "",
          country: data.country || "Rwanda",
          city: data.city || "",
          sector: data.sector || "",
          sectorOther: "",
          description: data.description || "",
          symbol: data.symbol || "",
          csdNumber: data.csdNumber || "",
        });

        setEmailForm({ email: data.email || "" });

        setMarketForm({
          sharePrice: data.sharePrice?.toString() || "",
          totalShares: data.totalShares?.toString() || "",
          availableShares: data.availableShares?.toString() || "",
        });

        setMarketReadOnly({
          closingPrice: data.closingPrice?.toString() || "0.00",
          previousClosingPrice: data.previousClosingPrice?.toString() || "0.00",
          tradedVolume: data.tradedVolume?.toString() || "0",
          tradedValue: data.tradedValue?.toString() || "0.00",
        });

        setDocuments(Array.isArray(data.documents) ? data.documents : []);
        setContract(data.contract || "");
      } catch (error) {
        console.error("Failed to fetch company data:", error);
      }
    };

    fetchCompanyData();
  }, [user?.id]);

  const handleCompanyInputChange = (field: keyof CompanyProfileForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setCompanyForm((prev) => ({ ...prev, [field]: value }));
      setCompanyErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
      setCompanyStatus("idle");
      setCompanyMessage(null);
    };

  const handleCompanySelectChange = (field: keyof CompanyProfileForm) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      setCompanyForm((prev) => ({ ...prev, [field]: value }));
      setCompanyErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
      setCompanyStatus("idle");
      setCompanyMessage(null);
    };

  const handleCompanySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id) return;

    const validation = companyProfileSchema.safeParse(companyForm);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const errors = Object.entries(fieldErrors).reduce<Partial<Record<keyof CompanyProfileForm, string>>>(
        (acc, [key, messages]) => {
          if (messages && messages[0]) {
            acc[key as keyof CompanyProfileForm] = messages[0];
          }
          return acc;
        },
        {}
      );
      setCompanyErrors(errors);
      setCompanyStatus("error");
      setCompanyMessage("Please fix the highlighted fields");
      return;
    }

    setCompanyStatus("saving");
    try {
      const payload = { ...validation.data };
      if (validation.data.sector === "Other" && validation.data.sectorOther) {
        payload.sector = validation.data.sectorOther;
      }
      delete payload.sectorOther;
      await api.patch(`/company/${user.id}`, payload);
      setCompanyStatus("success");
      setCompanyMessage("Company profile updated successfully");
      refreshAuth();
    } catch (error) {
      const err = error as Error;
      setCompanyStatus("error");
      setCompanyMessage(err.message || "Failed to update company profile");
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

    if (emailValue === companyForm.email.toLowerCase()) {
      setEmailError("Enter a different email address to update");
      setEmailStatus("error");
      return;
    }

    setEmailStatus("saving");
    try {
      const response = await api.patch(`/company/${user.id}`, { email: emailValue });
      const updated = response.data;
      setEmailForm({ email: updated.email });
      setCompanyForm((prev) => ({ ...prev, email: updated.email }));
      refreshAuth();

      setEmailStatus("success");
      setEmailMessage("We sent a verification code to your new email. Enter it to finish updating.");
      setOtpEmail(updated.email);
      setShowOtpModal(true);
    } catch (error) {
      const err = error as Error;
      setEmailStatus("error");
      setEmailMessage(err.message || "Failed to update email");
    }
  };

  const handleOtpVerified = useCallback(async () => {
    if (!user?.id) {
      setShowOtpModal(false);
      return;
    }
    try {
      const response = await api.get(`/company/${user.id}`);
      if (response?.data) {
        setEmailForm({ email: response.data.email });
        setCompanyForm((prev) => ({ ...prev, email: response.data.email }));
        refreshAuth();
        setEmailStatus("success");
        setEmailMessage("Email verified successfully");
      }
    } catch (error) {
      console.error("Failed to refresh company after email verification", error);
    } finally {
      setShowOtpModal(false);
    }
  }, [user?.id, refreshAuth]);

  const handleMarketInputChange = (field: keyof MarketDataForm) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setMarketForm((prev) => ({ ...prev, [field]: value }));
      setMarketErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
      setMarketStatus("idle");
      setMarketMessage(null);
    };

  const handleMarketSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id) return;

    const validation = marketDataSchema.safeParse(marketForm);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const errors = Object.entries(fieldErrors).reduce<Partial<Record<keyof MarketDataForm, string>>>(
        (acc, [key, messages]) => {
          if (messages && messages[0]) {
            acc[key as keyof MarketDataForm] = messages[0];
          }
          return acc;
        },
        {}
      );
      setMarketErrors(errors);
      setMarketStatus("error");
      setMarketMessage("Please fix the highlighted fields");
      return;
    }

    setMarketStatus("saving");
    try {
      const payload: Record<string, number | string> = {};
      if (validation.data.sharePrice) payload.sharePrice = parseFloat(validation.data.sharePrice);
      if (validation.data.totalShares) payload.totalShares = validation.data.totalShares;
      if (validation.data.availableShares) payload.availableShares = validation.data.availableShares;

      const response = await api.patch(`/company/${user.id}`, payload);
      const data = response.data;
      
      // Update read-only fields with latest data
      setMarketReadOnly({
        closingPrice: data.closingPrice?.toString() || "0.00",
        previousClosingPrice: data.previousClosingPrice?.toString() || "0.00",
        tradedVolume: data.tradedVolume?.toString() || "0",
        tradedValue: data.tradedValue?.toString() || "0.00",
      });
      
      setMarketStatus("success");
      setMarketMessage("Market data updated successfully");
    } catch (error) {
      const err = error as Error;
      setMarketStatus("error");
      setMarketMessage(err.message || "Failed to update market data");
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id) return;

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      setPasswordStatus("error");
      setPasswordMessage("New password must be at least 8 characters long");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus("error");
      setPasswordMessage("Passwords do not match");
      return;
    }

    setPasswordStatus("saving");
    try {
      await api.patch(`/company/${user.id}`, {
        password: passwordForm.newPassword,
      });
      setPasswordStatus("success");
      setPasswordMessage("Password updated successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      const err = error as Error;
      setPasswordStatus("error");
      setPasswordMessage(err.message || "Failed to update password");
    }
  };

  const renderCompanyProfile = () => (
    <Card className="p-6" hover={false}>
      <form className="flex flex-col gap-6" onSubmit={handleCompanySubmit}>
        <header>
          <h2 className="text-xl font-semibold text-[#004B5B]">Company Information</h2>
          <p className="mt-1 text-base text-slate-600">
            Update your company details and contact information
          </p>
        </header>

        {companyMessage && (
          <div
            className={`rounded-md border px-4 py-3 text-base ${
              companyStatus === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {companyMessage}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <InputField
            name="name"
            label="Company Name"
            type="text"
            placeholder="Enter company name"
            value={companyForm.name}
            onChange={handleCompanyInputChange("name")}
            error={companyErrors.name}
          />
          <div className="flex flex-col gap-2">
            <label htmlFor="phoneCountryCode" className="text-sm font-medium text-[#004B5B]">
              Phone Country Code
            </label>
            <select
              id="phoneCountryCode"
              value={companyForm.phoneCountryCode}
              onChange={handleCompanySelectChange("phoneCountryCode")}
              className="w-full rounded-full px-4 py-2 text-[#004B5B] bg-transparent outline-none border border-[#004B5B]/50 focus:border-[#004B5B]"
            >
              {phoneCountryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <InputField
            name="phone"
            label="Phone Number"
            type="tel"
            placeholder="Phone number"
            value={companyForm.phone}
            onChange={handleCompanyInputChange("phone")}
            error={companyErrors.phone}
          />
          <div className="flex flex-col gap-2">
            <label htmlFor="country" className="text-sm font-medium text-[#004B5B]">
              Country
            </label>
            <select
              id="country"
              value={companyForm.country}
              onChange={handleCompanySelectChange("country")}
              className="w-full rounded-full px-4 py-2 text-[#004B5B] bg-transparent outline-none border border-[#004B5B]/50 focus:border-[#004B5B]"
            >
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <InputField
            name="city"
            label="City"
            type="text"
            placeholder="City"
            value={companyForm.city}
            onChange={handleCompanyInputChange("city")}
            error={companyErrors.city}
          />
          <InputField
            name="symbol"
            label="Stock Symbol"
            type="text"
            placeholder="e.g., AAPL"
            value={companyForm.symbol ?? ""}
            onChange={handleCompanyInputChange("symbol")}
            error={companyErrors.symbol}
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#004B5B]">CSD Number</label>
            <div className="w-full rounded-full px-4 py-2 bg-slate-100 text-slate-600 border border-slate-300">
              {companyForm.csdNumber || "Not set"}
            </div>
            <p className="text-xs text-slate-500 ml-2">CSD Number cannot be changed</p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="sector" className="text-sm font-medium text-[#004B5B]">
              Sector
            </label>
            <select
              id="sector"
              value={companyForm.sector ?? ""}
              onChange={handleCompanySelectChange("sector")}
              className="w-full rounded-full px-4 py-2 text-[#004B5B] bg-transparent outline-none border border-[#004B5B]/50 focus:border-[#004B5B]"
            >
              {SECTOR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {companyForm.sector === "Other" && (
            <InputField
              name="sectorOther"
              label="Specify Sector"
              type="text"
              placeholder="Enter sector name"
              value={companyForm.sectorOther ?? ""}
              onChange={handleCompanyInputChange("sectorOther")}
              error={companyErrors.sectorOther}
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="text-sm font-medium text-[#004B5B]">
            Company Description
          </label>
          <textarea
            id="description"
            value={companyForm.description ?? ""}
            onChange={handleCompanyInputChange("description")}
            placeholder="Describe your company..."
            rows={4}
            className="w-full rounded-2xl px-4 py-2 text-[#004B5B] bg-transparent outline-none border border-[#004B5B]/50 focus:border-[#004B5B]"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="outline" disabled={companyStatus === "saving"} className="min-w-40">
            {companyStatus === "saving" ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Update Profile"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );

  const renderMarketData = () => (
    <Card className="p-6" hover={false}>
      <form className="flex flex-col gap-6" onSubmit={handleMarketSubmit}>
        <header>
          <h2 className="text-xl font-semibold text-[#004B5B]">Market Data</h2>
          <p className="mt-1 text-base text-slate-600">
            Manage share price and trading information
          </p>
        </header>

        {marketMessage && (
          <div
            className={`rounded-md border px-4 py-3 text-base ${
              marketStatus === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {marketMessage}
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Editable Fields</h3>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="sharePrice" className="text-sm font-medium text-[#004B5B]">
                Share Price (Rwf)
              </label>
              <input
                type="number"
                id="sharePrice"
                name="sharePrice"
                step="0.01"
                placeholder="0.00"
                value={marketForm.sharePrice ?? ""}
                onChange={handleMarketInputChange("sharePrice")}
                className={`w-full rounded-full px-4 py-2 text-[#004B5B] bg-transparent outline-none border transition-all ${
                  marketErrors.sharePrice
                    ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                    : "border-[#004B5B]/50 focus:border-[#004B5B] hover:border-[#004B5B]/80"
                }`}
              />
              {marketErrors.sharePrice && <p className="text-sm text-red-500 ml-2">{marketErrors.sharePrice}</p>}
            </div>
            <InputField
              name="totalShares"
              label="Total Shares"
              type="number"
              placeholder="0"
              value={marketForm.totalShares ?? ""}
              onChange={handleMarketInputChange("totalShares")}
              error={marketErrors.totalShares}
            />
            <InputField
              name="availableShares"
              label="Available Shares"
              type="number"
              placeholder="0"
              value={marketForm.availableShares ?? ""}
              onChange={handleMarketInputChange("availableShares")}
              error={marketErrors.availableShares}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Trading Data (Auto-calculated)</h3>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#004B5B]">Closing Price (Rwf)</label>
              <div className="w-full rounded-full px-4 py-2 bg-slate-100 text-slate-600 border border-slate-300">
                {parseFloat(marketReadOnly.closingPrice).toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 ml-2">Updated by trading activity</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#004B5B]">Previous Closing Price (Rwf)</label>
              <div className="w-full rounded-full px-4 py-2 bg-slate-100 text-slate-600 border border-slate-300">
                {parseFloat(marketReadOnly.previousClosingPrice).toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 ml-2">Last closing price</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#004B5B]">Traded Volume</label>
              <div className="w-full rounded-full px-4 py-2 bg-slate-100 text-slate-600 border border-slate-300">
                {parseFloat(marketReadOnly.tradedVolume).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 ml-2">Total shares traded</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#004B5B]">Traded Value (Rwf)</label>
              <div className="w-full rounded-full px-4 py-2 bg-slate-100 text-slate-600 border border-slate-300">
                {parseFloat(marketReadOnly.tradedValue).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 ml-2">Total value of trades</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="outline" disabled={marketStatus === "saving"} className="min-w-40">
            {marketStatus === "saving" ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </span>
            ) : (
              "Update Market Data"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );

  const renderDocuments = () => (
    <Card className="p-6" hover={false}>
      <h2 className="text-xl font-semibold text-[#004B5B]">Company Documents</h2>
      <p className="mt-1 text-base text-slate-600">Upload and manage company documents</p>
      <div className="mt-6 space-y-4">
        <FileUploadField
          name="contract"
          label="Company Contract"
          value={contract}
          onChange={setContract}
          accept="application/pdf"
          helperText="Upload company contract (PDF)"
        />
        <div className="text-sm text-slate-600">
          <p className="font-medium">Uploaded Documents:</p>
          {documents.length === 0 ? (
            <p className="text-slate-500 mt-2">No documents uploaded yet</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {documents.map((doc, index) => (
                <li key={index} className="text-blue-600 hover:underline">
                  {doc}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <Card className="p-6" hover={false}>
        <h2 className="text-xl font-semibold text-[#004B5B]">Login & Security</h2>
        <p className="mt-1 text-base text-slate-600">Update your email and password</p>

        <div className="mt-6 space-y-8">
          <form className="space-y-4" onSubmit={handleEmailSubmit}>
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <InputField
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your new email"
                  value={emailForm.email}
                  onChange={(event) => {
                    setEmailForm({ email: event.target.value });
                    setEmailError(null);
                    setEmailMessage(null);
                    setEmailStatus("idle");
                  }}
                  error={emailError ?? undefined}
                />
              </div>
              <Button type="submit" variant="outline" disabled={emailStatus === "saving"} className="md:min-w-44">
                {emailStatus === "saving" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  "Update Email"
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
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(e) => {
                  setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }));
                  setPasswordStatus("idle");
                  setPasswordMessage(null);
                }}
                showVisibilityToggle
              />
              <InputField
                name="newPassword"
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }));
                  setPasswordStatus("idle");
                  setPasswordMessage(null);
                }}
                showVisibilityToggle
              />
              <InputField
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }));
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
                  "Change Password"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "company":
        return renderCompanyProfile();
      case "market":
        return renderMarketData();
      case "documents":
        return renderDocuments();
      case "security":
        return renderSecurity();
      default:
        return null;
    }
  };

  return (
    <>
      <SettingsLayout
        title="Company Settings"
        description="Manage your company profile, market data, and security settings"
        navItems={navItems}
        activeItem={activeSection}
        onItemSelect={setActiveSection}
      >
        {renderContent()}
      </SettingsLayout>

      <OTPModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={otpEmail || emailForm.email}
        onVerified={handleOtpVerified}
        buildSuccessMessage={() => "Email verified successfully."}
        successRedirect={null}
      />
    </>
  );
}
