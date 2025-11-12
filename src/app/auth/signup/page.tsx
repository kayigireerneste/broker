"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { InputField } from "@/components/ui/InputField";
import OTPModal from "@/components/ui/OTPModal";
import toast, { Toaster } from "react-hot-toast";
import { SignupFormData, signupSchema, GENDER_VALUES } from "@/lib/validations/signupValidation";
import { authApi } from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { getData } from "country-list";
import { CountryCode, getCountryCallingCode } from "libphonenumber-js";
import Link from "next/link";

type SignupField = keyof SignupFormData;

const GENDER_LABELS: Record<(typeof GENDER_VALUES)[number], string> = {
  male: "Male",
  female: "Female",
};

const GENDER_OPTIONS = GENDER_VALUES.map((value) => ({ value, label: GENDER_LABELS[value] }));


export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: "",
    email: "",
    phoneCountryCode: "+250",
    phone: "",
    password: "",
    confirmPassword: "",
    country: "Rwanda",
    city: "",
    gender: "male",
  });

  const countryOptions = useMemo(() => {
    return getData()
      .map(({ name, code }) => {
        try {
          const dialCode = getCountryCallingCode(code as CountryCode);
          return {
            name,
            code,
            dialCode: `+${dialCode}`,
          };
        } catch {
          return null;
        }
      })
      .filter((item): item is { name: string; code: string; dialCode: string } => Boolean(item))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const clearErrorForField = (field: SignupField) => {
    const key = field as string;
    setErrors((prev) => {
      if (!(key in prev)) {
        return prev;
      }
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const focusField = (field?: string | number) => {
    if (!field) return;
    const fieldName = typeof field === "string" ? field : String(field);

    const focusTarget = () => {
      const element = document.querySelector<HTMLInputElement | HTMLSelectElement>(
        `[name="${fieldName}"]`
      );

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
    };

    if (typeof window !== "undefined") {
      window.requestAnimationFrame(focusTarget);
    }
  };

  function handleInputChange<K extends SignupField>(field: K) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setFormData((prev) => ({ ...prev, [field]: value }));
      clearErrorForField(field);
      setGeneralError(null);
    };
  }

  function handleSelectChange<K extends SignupField>(field: K) {
    return (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      setFormData((prev) => ({ ...prev, [field]: value }));
      clearErrorForField(field);
      setGeneralError(null);
    };
  }

  const handlePhoneCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setFormData((prev) => ({ ...prev, phoneCountryCode: value }));
    clearErrorForField("phoneCountryCode");
    clearErrorForField("phone");
    setGeneralError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);

    const validationResult = signupSchema.safeParse(formData);
    if (!validationResult.success) {
      const flat = validationResult.error.flatten();
      const fieldErrorsMap = flat.fieldErrors as Record<string, string[] | undefined>;
      const fieldErrors = Object.entries(fieldErrorsMap).reduce<Record<string, string>>(
        (acc, [key, messages]) => {
          if (messages && messages[0]) {
            acc[key] = messages[0];
          }
          return acc;
        },
        {}
      );
      setErrors(fieldErrors);

      const message =
        validationResult.error.issues[0]?.message ??
        "Please fix the highlighted fields before submitting.";
      setGeneralError(message);
      toast.error(message);

      const firstFieldKey =
        Object.keys(fieldErrors)[0] ??
        (typeof validationResult.error.issues[0]?.path[0] !== "undefined"
          ? String(validationResult.error.issues[0]?.path[0])
          : undefined);
      focusField(firstFieldKey);
      return;
    }

    const payload = validationResult.data;

    setErrors({});
    setIsLoading(true);

    try {
      const response = await authApi.signup(payload);
      setShowOTPModal(true);
      toast.success(response.message || "Account created! Please verify your email.");
    } catch (error) {
      const enrichedError = error as Error & {
        fieldErrors?: Array<{ field?: string; message: string }>;
      };

      if (Array.isArray(enrichedError.fieldErrors) && enrichedError.fieldErrors.length) {
        const mapped = enrichedError.fieldErrors.reduce((acc, issue) => {
          if (issue.field) {
            acc[issue.field] = issue.message;
          }
          return acc;
        }, {} as Record<string, string>);
        setErrors(mapped);
        setGeneralError("Please fix the highlighted fields and try again.");
  focusField(enrichedError.fieldErrors[0]?.field);
        toast.error("Please fix the highlighted fields and try again.");
      } else {
        const message =
          enrichedError.message || "Failed to create account. Please try again.";
        setGeneralError(message);
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative w-full max-w-2xl animate-fadeInUp">
        <div className="mb-2 text-center">
          <Link
            href="/"
            className="text-white/80 hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-600">
              Complete the form below to join Broker in just a few minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Toaster position="top-right" />
            {generalError && (
              <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {generalError}
              </div>
            )}
            <motion.div
              className="space-y-6 animate-fadeInUp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid gap-6 md:grid-cols-2">
                <InputField
                  name="fullName"
                  label="Full Name"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange("fullName")}
                  error={errors.fullName}
                  disabled={isLoading}
                  placeholder="Enter your full name"
                  required
                />
                <InputField
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  error={errors.email}
                  disabled={isLoading}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#004B5B]">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <select
                    name="phoneCountryCode"
                    value={formData.phoneCountryCode}
                    onChange={handlePhoneCountryChange}
                    disabled={isLoading}
                    className={`h-12 w-full sm:w-[200px] rounded-full border px-4 text-[#004B5B] bg-white/90 outline-none transition-all focus:outline-none ${
                      errors.phoneCountryCode
                        ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                        : "border-[#004B5B]/50 focus:border-[#004B5B] hover:border-[#004B5B]/80"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {countryOptions.map(({ name, dialCode, code }) => (
                      <option key={code} value={dialCode} className="text-[#004B5B]">
                        {name} ({dialCode})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange("phone")}
                    disabled={isLoading}
                    placeholder="Enter your phone number"
                    className={`h-12 w-full sm:flex-1 rounded-full px-4 text-[#004B5B] bg-white/90 outline-none border transition-all focus:outline-none ${
                      errors.phone
                        ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                        : "border-[#004B5B]/50 focus:border-[#004B5B] hover:border-[#004B5B]/80"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                </div>
                {(errors.phoneCountryCode || errors.phone) && (
                  <p className="mt-1 text-sm text-red-500 ml-2">
                    {errors.phoneCountryCode || errors.phone}
                  </p>
                )}
              </div>
            </motion.div>

            <motion.div
              className="space-y-6 animate-fadeInUp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <div className="grid gap-6 md:grid-cols-2">
                <InputField
                  name="password"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  error={errors.password}
                  disabled={isLoading}
                  placeholder="Enter a strong password"
                  required
                  showVisibilityToggle
                />
                <InputField
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange("confirmPassword")}
                  error={errors.confirmPassword}
                  disabled={isLoading}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              className="space-y-6 animate-fadeInUp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="country" className="block text-sm font-medium text-[#004B5B]">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleSelectChange("country")}
                    disabled={isLoading}
                    className={`w-full rounded-full px-4 py-2 text-[#004B5B] bg-transparent outline-none border transition-all ${
                      errors.country
                        ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                        : "border-[#004B5B]/50 focus:border-[#004B5B] hover:border-[#004B5B]/80"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {countryOptions.map(({ name, code }) => (
                      <option key={code} value={name} className="text-[#004B5B]">
                        {name}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-500 ml-2">{errors.country}</p>
                  )}
                </div>

                <InputField
                  name="city"
                  label="City"
                  type="text"
                  value={formData.city}
                  onChange={handleInputChange("city")}
                  error={errors.city}
                  disabled={isLoading}
                  placeholder="Enter your city"
                  required
                />

                <div className="space-y-2">
                  <label htmlFor="gender" className="block text-sm font-medium text-[#004B5B]">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleSelectChange("gender")}
                    disabled={isLoading}
                    className={`w-full rounded-full px-4 py-2 text-[#004B5B] bg-transparent outline-none border transition-all ${
                      errors.gender
                        ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                        : "border-[#004B5B]/50 focus:border-[#004B5B] hover:border-[#004B5B]/80"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {GENDER_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value} className="text-[#004B5B]">
                        {label}
                      </option>
                    ))}
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-500 ml-2">{errors.gender}</p>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-[#004F64] focus:ring-[#004F64]"
                required
              />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <Link href="#" className="text-[#004F64] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-[#004F64] hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <motion.button
              whileHover={{
                scale: isLoading ? 1 : 1.05,
                backgroundColor: "#003641",
                color: "#fff",
              }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              transition={{ type: "spring", stiffness: 200 }}
              type="submit"
              disabled={isLoading}
              className={`bg-[#004B5B] text-white font-semibold px-8 py-3 rounded-full w-full flex items-center justify-center ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-[#004F64] font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
      <OTPModal 
        isOpen={showOTPModal} 
        onClose={() => setShowOTPModal(false)}
        email={formData.email} 
      />
    </div>
  );
}