"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAxiosError } from "axios";
import axiosInstance from "@/lib/axios";
import toast, { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { loginSchema } from "@/lib/validations/loginValidation";
import { z } from "zod";
import { getDashboardPath } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = loginSchema.parse(formData);
      const data = await axiosInstance.post("/api/auth/login", validatedData);

      // Log the response for debugging
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

      // Store auth data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      document.cookie = `token=${token}; path=/`;
      
      toast.success(message || "Login successful!");

      const dashboardHref = getDashboardPath(
        typeof user === "object" && user !== null && "role" in user
          ? (user as { role?: string }).role
          : undefined
      );

      router.push(dashboardHref);
    } catch (error) {
      console.error("Login error:", error);

      if (error instanceof z.ZodError) {
        // Handle validation errors
        const firstError = error.issues[0];
        toast.error(firstError.message || "Please check your input");
      } else if (isAxiosError(error)) {
        // Handle API errors
        const errorMessage = error.response?.data?.error || error.message;
        toast.error(errorMessage || "Login failed. Please try again.");
      } else {
        // Handle other errors
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        toast.error(errorMessage);
        console.error("Login error:", error);
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
            <motion.input
              whileFocus={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200 }}
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="w-full rounded-full px-4 py-2 text-[#004B5B] bg-transparent outline-none border border-[#004B5B]/50 focus:border-[#004B5B]"
            />

            <motion.input
              whileFocus={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200 }}
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="w-full rounded-full px-4 py-2 text-[#004B5B] bg-transparent outline-none border border-[#004B5B]/50 focus:border-[#004B5B]"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#004F64] focus:ring-[#004F64]"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-[#004F64] hover:underline">
                Forgot password?
              </a>
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
              <a
                href="/auth/signup"
                className="text-[#004F64] font-semibold hover:underline"
              >
                Sign up
              </a>
            </p>
          </div>
        </Card>

          <Link
            href="/"
            className="text-white/80 hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
  );
}
