import { Prisma } from "@prisma/client";

export const companySelect = {
  id: true,
  name: true,
  ticker: true,
  description: true,
  sector: true,
  sharePrice: true,
  totalShares: true,
  availableShares: true,
  closingPrice: true,
  previousClosingPrice: true,
  priceChange: true,
  tradedVolume: true,
  tradedValue: true,
  snapshotDate: true,
  contract: true,
  createdBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CompanySelect;
