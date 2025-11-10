import { z } from "zod";

const numericString = z
  .union([z.string(), z.number()])
  .transform((value) => {
    if (typeof value === "number") return value.toString();
    return value.trim();
  })
  .refine((value) => value === "" || !Number.isNaN(Number(value)), {
    message: "Value must be a valid number",
  });

const positiveInteger = z
  .number({ error: "Must be a number" })
  .int({ message: "Must be an integer" })
  .positive({ message: "Must be greater than zero" });

const nonNegativeInteger = z
  .number({ error: "Must be a number" })
  .int({ message: "Must be an integer" })
  .nonnegative({ message: "Must be zero or greater" });

const isoDateString = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return false;
    const date = new Date(value);
    return !Number.isNaN(date.valueOf());
  }, "Snapshot date must be a valid date");

const baseCompanySchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    ticker: z
      .string()
      .trim()
      .min(1, "Ticker is required")
      .max(10, "Ticker must be 10 characters or fewer")
      .transform((value) => value.toUpperCase()),
    description: z.string().trim().max(2000).optional(),
    sector: z.string().trim().max(255).optional(),
    sharePrice: numericString.optional(),
    totalShares: positiveInteger.optional(),
    availableShares: nonNegativeInteger.optional(),
    closingPrice: numericString.optional(),
    previousClosingPrice: numericString.optional(),
    priceChange: z.string().trim().max(50).optional(),
    tradedVolume: numericString.optional(),
    tradedValue: numericString.optional(),
    snapshotDate: isoDateString.optional(),
    contract: z.string().trim().max(512).optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.availableShares !== undefined &&
      value.totalShares !== undefined &&
      value.availableShares > value.totalShares
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["availableShares"],
        message: "Available shares cannot exceed total shares",
      });
    }

    if (value.snapshotDate !== undefined) {
      const parsedDate = new Date(value.snapshotDate);
      if (Number.isNaN(parsedDate.valueOf())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["snapshotDate"],
          message: "Snapshot date must be a valid date",
        });
      }
    }
  });

export const companyCreateSchema = baseCompanySchema;

export const companyUpdateSchema = baseCompanySchema
  .partial()
  .refine((val) => Object.keys(val).length > 0, {
    message: "At least one field must be provided",
  });

export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;
export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;
