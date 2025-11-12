import { Prisma } from "@prisma/client";

export const companySelect: Prisma.CompanySelect = {
  id: true,
  name: true,
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
      fullName: true,
      email: true,
      role: true,
    },
  },
  createdAt: true,
  updatedAt: true,
};
