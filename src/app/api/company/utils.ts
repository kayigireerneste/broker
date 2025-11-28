import { Prisma } from "@prisma/client";

export const toDecimalOrUndefined = (value?: string | number | null) => {
  if (value === undefined || value === null) return undefined;
  const stringValue = typeof value === 'number' ? value.toString() : value;
  const normalized = stringValue
    .replace(/[\s,]/g, "")
    .replace(/[^0-9.\-]/g, "")
    .trim();
  if (!normalized) return undefined;
  return new Prisma.Decimal(normalized);
};
