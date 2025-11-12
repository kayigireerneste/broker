import { Prisma } from "@prisma/client";

export const toDecimalOrUndefined = (value?: string | null) => {
  if (value === undefined || value === null) return undefined;
  const normalized = value
    .replace(/[\s,]/g, "")
    .replace(/[^0-9.\-]/g, "")
    .trim();
  if (!normalized) return undefined;
  return new Prisma.Decimal(normalized);
};
