/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { InputField } from "@/components/ui/InputField";
import OTPModal from "@/components/ui/OTPModal";
import toast, { Toaster } from 'react-hot-toast';
import { SignupFormData, signupSchema, stepSchemas } from "@/lib/validations/signupValidation";
import { z } from "zod";
import { authApi } from "@/lib/axios";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    idNumber: "",
    dateOfBirth: "",
    address: "",
    occupation: "",
    investmentExperience: "",
  });

  const handleNext = () => {
    try {
      stepSchemas[step as keyof typeof stepSchemas].parse(formData);
      setErrors({});
      setStep(step + 1);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const stepErrors = error.issues.reduce((acc: Record<string, string>, err) => {
          if (err.path[0]) {
            acc[err.path[0].toString()] = err.message;
          }
          return acc;
        }, {});
        setErrors(stepErrors);
        toast.error('Please fix the errors before proceeding');
      }
    }
  };
  
  const handlePrev = () => setStep(step - 1);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      signupSchema.parse(formData);
      
      const signupData = { ...formData };
      
      setIsLoading(true);
      await toast.promise(
        authApi.signup(signupData),
        {
          loading: 'Creating your account...',
          success: (response) => {
            setShowOTPModal(true);
            return response.message || 'Account created! Please verify your email.';
          },
          error: (err) => err.message || 'Failed to create account. Please try again.'
        }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formErrors = error.issues.reduce((acc: Record<string, string>, err) => {
          if (err.path[0]) {
            acc[err.path[0].toString()] = err.message;
          }
          return acc;
        }, {});
        setErrors(formErrors);
        toast.error('Please fix all errors before submitting');
      } else {
        console.error('Signup error:', error);
      }
    } finally {
      setIsLoading(false);
    }

    setIsLoading(true);
    try {
      await toast.promise(
        authApi.signup({ ...formData }),
        {
          loading: 'Creating your account...',
          success: (response) => {
            setShowOTPModal(true);
            return response.message || 'Account created! Please verify your email.';
          },
          error: (err) => err.message || 'Failed to create account. Please try again.'
        }
      );
    } catch (err) {
      console.error('Signup error:', err);
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
              Join Broker and start your investment journey
            </p>

            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i <= step ? "bg-[#004F64]" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Toaster position="top-right" />
            
            {step === 1 && (
              <motion.div 
                className="space-y-6 animate-fadeInUp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Personal Information
                </h3>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField
                      name="firstName"
                      label="First Name"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      error={errors.firstName}
                      disabled={isLoading}
                      placeholder="Enter your first name"
                      required
                    />
                    <InputField
                      name="lastName"
                      label="Last Name"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      error={errors.lastName}
                      disabled={isLoading}
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                  <InputField
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    disabled={isLoading}
                    placeholder="Enter your email address"
                    required
                  />
                  <InputField
                    name="phone"
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={errors.phone}
                    disabled={isLoading}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#003641",
                      color: "#fff",
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    type="button"
                    onClick={handleNext}
                    disabled={isLoading}
                    className={`bg-[#004B5B] text-white font-semibold px-8 py-2 rounded-full w-full md:w-auto ${
                      isLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    Next Step
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                className="space-y-6 animate-fadeInUp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Security & Verification
                </h3>
                <div className="space-y-6">
                  <InputField
                    name="password"
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
                    disabled={isLoading}
                    placeholder="Enter your password"
                    required
                  />
                  <InputField
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    error={errors.confirmPassword}
                    disabled={isLoading}
                    placeholder="Confirm your password"
                    required
                  />
                  <InputField
                    name="idNumber"
                    label="National ID Number"
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    error={errors.idNumber}
                    disabled={isLoading}
                    placeholder="Enter your National ID number"
                    required
                  />
                  <InputField
                    name="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    error={errors.dateOfBirth}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="flex justify-between">
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#E5E5E5",
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    onClick={handlePrev}
                    type="button"
                    className="border border-[#004B5B]/50 text-[#004B5B] font-semibold px-8 py-2 rounded-full w-full md:w-auto bg-transparent"
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#003641",
                      color: "#fff",
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    onClick={handleNext}
                    type="button"
                    className="bg-[#004B5B] text-white font-semibold px-8 py-2 rounded-full w-full md:w-auto"
                  >
                    Next Step
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                className="space-y-6 animate-fadeInUp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Other Information
                </h3>
                <div className="space-y-6">
                  <InputField
                    name="address"
                    label="Address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    error={errors.address}
                    disabled={isLoading}
                    placeholder="Enter your address"
                    required
                  />
                  <InputField
                    name="occupation"
                    label="Occupation"
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    error={errors.occupation}
                    disabled={isLoading}
                    placeholder="Enter your occupation"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Experience
                  </label>
                  <select
                    value={formData.investmentExperience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        investmentExperience: e.target.value,
                      })
                    }
                    className="w-full rounded-full px-4 py-2 text-[#004B5B] bg-transparent border border-[#004B5B]/50 focus:border-[#004B5B] outline-none"
                  >
                    <option value="beginner">Beginner (0-1 years)</option>
                    <option value="intermediate">
                      Intermediate (1-5 years)
                    </option>
                    <option value="experienced">Experienced (5+ years)</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[#004F64] focus:ring-[#004F64]"
                    required
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the{" "}
                    <a href="#" className="text-[#004F64] hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-[#004F64] hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </div>

                <div className="flex justify-between">
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#E5E5E5",
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    onClick={handlePrev}
                    type="button"
                    className="border border-[#004B5B]/50 text-[#004B5B] font-semibold px-8 py-2 rounded-full w-full md:w-auto bg-transparent"
                  >
                    Previous
                  </motion.button>

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
                    className={`bg-[#004B5B] text-white font-semibold px-8 py-2 rounded-full w-full md:w-auto flex items-center justify-center ${
                      isLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a
                href="/auth/login"
                className="text-[#004F64] font-semibold hover:underline"
              >
                Sign in
              </a>
            </p>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-white/80 hover:text-white transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>

      <OTPModal 
        isOpen={showOTPModal} 
        onClose={() => setShowOTPModal(false)}
        email={formData.email} 
      />
    </div>
  );
}