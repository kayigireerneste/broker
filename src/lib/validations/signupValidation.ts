import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";

const MIN_NAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;
const ONE_YEAR_IN_MS = 365.25 * 24 * 60 * 60 * 1000;
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"] as const;
const DOCUMENT_EXTENSIONS = [...IMAGE_EXTENSIONS, "pdf"] as const;

const FILE_EXTENSION_REGEX = /\.([a-z0-9]+)(?:\?|#|$)/i;

const isHttpLike = (value: string) => /^(https?:\/\/)/i.test(value);
const isDataUri = (value: string) => /^data:/i.test(value);

const hasAllowedExtension = (value: string, allowed: ReadonlyArray<string>) => {
  const match = value.match(FILE_EXTENSION_REGEX);
  if (!match) return false;
  const ext = match[1]?.toLowerCase();
  return allowed.includes(ext as (typeof allowed)[number]);
};

const validateFileReference = (
  value: string,
  allowedExtensions: ReadonlyArray<string>,
  message: string,
  ctx: z.RefinementCtx,
  path: string
) => {
  if (!isHttpLike(value) && !isDataUri(value)) {
    ctx.addIssue({
      path: [path],
      code: z.ZodIssueCode.custom,
      message: "File reference must be an http(s) url or a data URI",
    });
    return;
  }

  if (isHttpLike(value) && !hasAllowedExtension(value, allowedExtensions)) {
    ctx.addIssue({ path: [path], code: z.ZodIssueCode.custom, message });
  }
};
export const GENDER_VALUES = ["male", "female"] as const;

export const baseSignupSchema = z.object({
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
  passportPhoto: z
    .string()
    .trim()
    .min(1, "Passport photo is required"),
  idDocument: z
    .string()
    .trim()
    .min(1, "Identification document is required"),
  dateOfBirth: z.string().trim().min(1, "Date of birth is required"),
  gender: z
    .string()
    .trim()
    .min(1, "Gender is required")
    .refine((value) => GENDER_VALUES.includes(value as (typeof GENDER_VALUES)[number]), {
      message: "Gender must be either male or female",
    }),
  country: z.string().trim().min(1, "Country is required"),
  city: z.string().trim().min(1, "City is required"),
  occupation: z.string().trim().min(1, "Occupation is required"),
  investmentExperience: z.string().trim().min(1, "Investment experience is required"),
});

export type SignupFormData = z.input<typeof baseSignupSchema>;

export const normalizePhone = (code: string, phone: string) => `${code}${phone}`.replace(/\s+/g, "");

export const validatePasswordConfirmation = <T extends { password: string; confirmPassword: string }>(
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

export const validateDateOfBirth = <T extends { dateOfBirth: string }>(data: T, ctx: z.RefinementCtx) => {
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

export const validatePhoneNumber = <T extends { phoneCountryCode: string; phone: string }>(
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
  gender: true,
  occupation: true,
  investmentExperience: true,
});

export const signupSchema = baseSignupSchema
  .superRefine((data, ctx) => {
    validatePasswordConfirmation(data, ctx);
    validateDateOfBirth(data, ctx);
    validatePhoneNumber(data, ctx);

    validateFileReference(
      data.passportPhoto,
      IMAGE_EXTENSIONS,
      "Passport photo must be an image file",
      ctx,
      "passportPhoto"
    );

    validateFileReference(
      data.idDocument,
      DOCUMENT_EXTENSIONS,
      "Identification document must be an image or PDF",
      ctx,
      "idDocument"
    );
  })
  .transform((data) => {
    const { passportPhoto, idDocument, confirmPassword, ...rest } = data;
    void confirmPassword;

    const normalizedPhone = normalizePhone(data.phoneCountryCode, data.phone);
    const phoneNumber = parsePhoneNumberFromString(normalizedPhone);
    const normalizedDob = new Date(data.dateOfBirth);
    const normalizedGender = (rest.gender?.trim().toLowerCase() as (typeof GENDER_VALUES)[number]) ?? "male";

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
      gender: normalizedGender ?? "male",
      passportPhoto: passportPhoto.trim(),
      idDocument: idDocument.trim(),
    };
  });

export type SignupPayload = z.infer<typeof signupSchema>;