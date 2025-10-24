import { z } from "zod";

export const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required").trim(),
  lastName: z.string().min(1, "Last name is required").trim(),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[\d\s-]+$/, "Invalid phone number format"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  idNumber: z.string().min(1, "ID number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(1, "Address is required"),
  occupation: z.string().min(1, "Occupation is required"),
  investmentExperience: z.string().min(1, "Investment experience is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignupFormData = z.infer<typeof signupSchema>;

export const stepSchemas = {
  1: signupSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
  }),
  2: signupSchema.pick({
    password: true,
    confirmPassword: true,
  }),
  3: signupSchema.pick({
    idNumber: true,
    dateOfBirth: true,
    address: true,
  }),
  4: signupSchema.pick({
    occupation: true,
    investmentExperience: true,
  }),
};

type ValidationResult = Record<string, string>;

export const validateSignupStep = (step: number, formData: SignupFormData): ValidationResult => {
  try {
    stepSchemas[step as keyof typeof stepSchemas].parse(formData);
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues.reduce((acc: ValidationResult, err) => {
        if (err.path[0]) {
          acc[err.path[0].toString()] = err.message;
        }
        return acc;
      }, {});
    }
    return {};
  }
};

export const validateFullForm = (formData: SignupFormData): ValidationResult => {
  try {
    signupSchema.parse(formData);
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues.reduce((acc: ValidationResult, err) => {
        if (err.path[0]) {
          acc[err.path[0].toString()] = err.message;
        }
        return acc;
      }, {});
    }
    return {};
  }
};