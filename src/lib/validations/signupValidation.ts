import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";

const MIN_NAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;
const ONE_YEAR_IN_MS = 365.25 * 24 * 60 * 60 * 1000;

const baseSignupSchema = z.object({
  firstName: z.string().trim().min(MIN_NAME_LENGTH, "First name must be at least 3 characters"),
  lastName: z.string().trim().min(MIN_NAME_LENGTH, "Last name must be at least 3 characters"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email format"),
  phoneCountryCode: z.string().trim().min(1, "Phone country code is required").regex(/^\+[0-9]{1,4}$/, "Invalid country calling code"),
  phone: z.string().trim().min(4, "Phone number must contain digits"),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  idNumber: z.string().trim().min(1, "ID number is required"),
  dateOfBirth: z.string().trim().min(1, "Date of birth is required"),
  country: z.string().trim().min(1, "Country is required"),
  city: z.string().trim().min(1, "City is required"),
  occupation: z.string().trim().min(1, "Occupation is required"),
  investmentExperience: z.string().trim().min(1, "Investment experience is required"),
});

export type SignupFormData = z.input<typeof baseSignupSchema>;

const normalizePhone = (code: string, phone: string) => `${code}${phone}`.replace(/\s+/g, "");

const validatePasswordConfirmation = <T extends { password: string; confirmPassword: string }>(
  data: T,
  ctx: z.RefinementCtx
) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      path: ["confirmPassword"],
      code: z.ZodIssueCode.custom,
      message: "Passwords don't match",
    });
  }
};

const validateDateOfBirth = <T extends { dateOfBirth: string }>(data: T, ctx: z.RefinementCtx) => {
  const rawDob = new Date(data.dateOfBirth);
  if (Number.isNaN(rawDob.getTime())) {
    ctx.addIssue({
      path: ["dateOfBirth"],
      code: z.ZodIssueCode.custom,
      message: "Invalid date of birth",
    });
    return;
  }

  const now = Date.now();
  if (rawDob.getTime() > now) {
    ctx.addIssue({
      path: ["dateOfBirth"],
      code: z.ZodIssueCode.custom,
      message: "Date of birth cannot be in the future",
    });
  } else if (now - rawDob.getTime() < ONE_YEAR_IN_MS) {
    ctx.addIssue({
      path: ["dateOfBirth"],
      code: z.ZodIssueCode.custom,
      message: "You must be at least one year old",
    });
  }
};

const validatePhoneNumber = <T extends { phoneCountryCode: string; phone: string }>(
  data: T,
  ctx: z.RefinementCtx
) => {
  const combined = normalizePhone(data.phoneCountryCode, data.phone);
  const phoneNumber = parsePhoneNumberFromString(combined);
  if (!phoneNumber || !phoneNumber.isValid()) {
    ctx.addIssue({
      path: ["phone"],
      code: z.ZodIssueCode.custom,
      message: "Invalid phone number for the selected country code",
    });
  }
};

export const personalInfoSchema = baseSignupSchema
  .pick({ firstName: true, lastName: true, email: true, phoneCountryCode: true, phone: true })
  .superRefine((data, ctx) => {
    validatePhoneNumber(data, ctx);
  });

export const securityInfoSchema = baseSignupSchema
  .pick({ password: true, confirmPassword: true, idNumber: true, dateOfBirth: true })
  .superRefine((data, ctx) => {
    validatePasswordConfirmation(data, ctx);
    validateDateOfBirth(data, ctx);
  });

export const otherInfoSchema = baseSignupSchema.pick({
  country: true,
  city: true,
  occupation: true,
  investmentExperience: true,
});

export const signupSchema = baseSignupSchema
  .superRefine((data, ctx) => {
    validatePasswordConfirmation(data, ctx);
    validateDateOfBirth(data, ctx);
    validatePhoneNumber(data, ctx);
  })
  .transform((data) => {
    const normalizedPhone = normalizePhone(data.phoneCountryCode, data.phone);
    const phoneNumber = parsePhoneNumberFromString(normalizedPhone);
    const normalizedDob = new Date(data.dateOfBirth);

    const { confirmPassword, ...rest } = data;
    void confirmPassword;

    return {
      ...rest,
      firstName: rest.firstName.trim(),
      lastName: rest.lastName.trim(),
      email: rest.email.trim().toLowerCase(),
      phoneCountryCode: rest.phoneCountryCode.trim(),
      phone: phoneNumber ? phoneNumber.number : normalizedPhone,
      dateOfBirth: normalizedDob.toISOString(),
      country: rest.country.trim(),
      city: rest.city.trim(),
      occupation: rest.occupation.trim(),
      investmentExperience: rest.investmentExperience.trim(),
    };
  });

export type SignupPayload = z.infer<typeof signupSchema>;