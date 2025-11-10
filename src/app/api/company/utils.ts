import { Prisma } from "@prisma/client";

export const toDecimalOrUndefined = (value?: string | null) => {
  if (value === undefined || value === null) return undefined;
  const normalized = value.trim();
  if (!normalized) return undefined;
  return new Prisma.Decimal(normalized);
};
