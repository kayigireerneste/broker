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

const signupFormSchema = z.object({
  fullName: z.string().trim().min(MIN_NAME_LENGTH, "Full name must be at least 3 characters"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email format"),
  phoneCountryCode: z
    .string()
    .trim()
    .min(1, "Phone country code is required")
    .regex(/^\+[0-9]{1,4}$/, "Invalid country calling code"),
  phone: z.string().trim().min(4, "Phone number must contain digits"),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  gender: z
    .string()
    .trim()
    .min(1, "Gender is required")
    .refine((value) => GENDER_VALUES.includes(value as (typeof GENDER_VALUES)[number]), {
      message: "Gender must be either male or female",
    }),
  country: z.string().trim().min(1, "Country is required"),
  city: z.string().trim().min(1, "City is required"),
});

const profileDetailsBaseSchema = z.object({
  idNumber: z.string().trim().optional(),
  passportPhoto: z.string().trim().optional(),
  idDocument: z.string().trim().optional(),
  dateOfBirth: z.string().trim().optional(),
  occupation: z.string().trim().optional(),
  investmentExperience: z.string().trim().optional(),
});

export const profileDetailsSchema = profileDetailsBaseSchema;

export const validateProfileDetails = (
  data: z.infer<typeof profileDetailsBaseSchema>,
  ctx: z.RefinementCtx
) => {
  if (data.dateOfBirth) {
    validateDateOfBirth({ dateOfBirth: data.dateOfBirth }, ctx);
  }

  const passportPhoto = data.passportPhoto?.trim();
  if (passportPhoto) {
    validateFileReference(
      passportPhoto,
      IMAGE_EXTENSIONS,
      "Passport photo must be an image file",
      ctx,
      "passportPhoto"
    );
  }

  const idDocument = data.idDocument?.trim();
  if (idDocument) {
    validateFileReference(
      idDocument,
      DOCUMENT_EXTENSIONS,
      "Identification document must be an image or PDF",
      ctx,
      "idDocument"
    );
  }
};

export const baseSignupSchema = signupFormSchema.merge(profileDetailsBaseSchema);

export type SignupFormData = z.input<typeof signupFormSchema>;

const toOptionalTrimmed = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
};

const normalizeEssentialFields = (data: z.infer<typeof signupFormSchema>) => {
  const normalizedPhone = normalizePhone(data.phoneCountryCode, data.phone);
  const phoneNumber = parsePhoneNumberFromString(normalizedPhone);
  const normalizedGender = (data.gender?.trim().toLowerCase() as (typeof GENDER_VALUES)[number]) ?? "male";

  return {
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    phoneCountryCode: data.phoneCountryCode.trim(),
    phone: phoneNumber ? phoneNumber.number : normalizedPhone,
    password: data.password,
    confirmPassword: data.confirmPassword,
    gender: normalizedGender ?? "male",
    country: data.country.trim(),
    city: data.city.trim(),
  };
};

const normalizeProfileDetails = (data: z.infer<typeof profileDetailsBaseSchema>) => {
  const normalizedDob = data.dateOfBirth ? new Date(data.dateOfBirth) : null;

  return {
    idNumber: toOptionalTrimmed(data.idNumber),
    passportPhoto: toOptionalTrimmed(data.passportPhoto),
    idDocument: toOptionalTrimmed(data.idDocument),
    dateOfBirth:
      normalizedDob && !Number.isNaN(normalizedDob.getTime())
        ? normalizedDob.toISOString()
        : undefined,
    occupation: toOptionalTrimmed(data.occupation),
    investmentExperience: toOptionalTrimmed(data.investmentExperience),
  };
};

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

export const validateDateOfBirth = <T extends { dateOfBirth?: string | null }>(data: T, ctx: z.RefinementCtx) => {
  const rawValue = data.dateOfBirth?.trim();
  if (!rawValue) {
    return;
  }

  const rawDob = new Date(rawValue);
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
  .pick({ fullName: true, email: true, phoneCountryCode: true, phone: true })
  .superRefine((data, ctx) => {
    validatePhoneNumber(data, ctx);
  });

export const securityInfoSchema = baseSignupSchema
  .pick({ password: true, confirmPassword: true })
  .superRefine((data, ctx) => {
    validatePasswordConfirmation(data, ctx);
  });

export const otherInfoSchema = baseSignupSchema.pick({
  country: true,
  city: true,
  gender: true,
});

export const signupSchema = signupFormSchema
  .superRefine((data, ctx) => {
    validatePasswordConfirmation(data, ctx);
    validatePhoneNumber(data, ctx);
  })
  .transform((data) => normalizeEssentialFields(data));

export const userCreationSchema = baseSignupSchema
  .superRefine((data, ctx) => {
    validatePasswordConfirmation(data, ctx);
    validatePhoneNumber(data, ctx);
    validateProfileDetails(data, ctx);
  })
  .transform((data) => {
    const essentials = normalizeEssentialFields(data);
    const profile = normalizeProfileDetails(data);
    return {
      ...essentials,
      ...profile,
    };
  });

export type SignupPayload = z.infer<typeof signupSchema>;
export type UserCreationPayload = z.infer<typeof userCreationSchema>;