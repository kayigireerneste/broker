"use client";

import { useState, type ChangeEvent, type FormEvent, Suspense } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { InputField } from "@/components/ui/InputField";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { isAxiosError } from "axios";
import axiosInstance from "@/lib/axios";
import toast, { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validations/loginValidation";
import { getDashboardPath } from "@/hooks/useAuth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

  const fieldSchemas = {
    email: loginSchema.shape.email,
    password: loginSchema.shape.password,
  } as const;

  const handleInputChange = (field: keyof LoginFormData) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    const result = fieldSchemas[field].safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const validationResult = loginSchema.safeParse(formData);
      if (!validationResult.success) {
        // use ZodError.flatten() to get fieldErrors in a typed-safe way
        const fieldErrors = validationResult.error.flatten().fieldErrors;
        setErrors({
          email: fieldErrors.email?.[0],
          password: fieldErrors.password?.[0],
        });
        toast.error(fieldErrors.email?.[0] || fieldErrors.password?.[0] || "Please check your input");
        return;
      }

      const validatedData = validationResult.data;
      const data = await axiosInstance.post("/auth/login", validatedData);

      console.log("Login response:", data);

      if (!data || typeof data !== "object") {
        throw new Error("Invalid response from server");
      }

      const { token, user, message } = data as {
        token?: string;
        user?: unknown;
        message?: string;
        error?: string;
      };

      if (!token || !user) {
        const apiError = (data as { error?: string }).error;
        throw new Error(apiError || "Missing token or user data in response");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      document.cookie = `token=${token}; path=/`;
      
      toast.success(message || "Login successful!");

      const dashboardHref = getDashboardPath(
        typeof user === "object" && user !== null && "role" in user
          ? (user as { role?: string }).role
          : undefined
      );

      const redirectTarget = (() => {
        const redirectParam = searchParams.get("redirect");
        if (redirectParam && redirectParam.startsWith("/")) {
          return redirectParam;
        }
        return dashboardHref;
      })();

      router.push(redirectTarget);
    } catch (error) {
      console.error("Login error:", error);
      const apiError = error as Error & { status?: number };

      if (apiError && typeof apiError === "object" && "status" in apiError) {
        toast.error(apiError.message || "Login failed. Please try again.");
      } else if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        toast.error(errorMessage || "Login failed. Please try again.");
      } else {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative w-full max-w-md animate-fadeInUp">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your Broker account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              name="email"
              label="Email Address"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange("email")}
              required
              error={errors.email}
            />

            <InputField
              name="password"
              label="Password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange("password")}
              required
              showVisibilityToggle
              error={errors.password}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#004F64] focus:ring-[#004F64]"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="#" className="text-sm text-[#004F64] hover:underline">
                Forgot password?
              </Link>
            </div>

            <motion.button
              disabled={loading}
              whileHover={{
                scale: loading ? 1 : 1.05,
              }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              transition={{ type: "spring", stiffness: 200 }}
              type="submit"
              className={`w-full rounded-full px-6 py-3 text-white bg-[#004F64] hover:bg-[#004F64]/90 flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-[#004F64] font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>
        </div>
      </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
