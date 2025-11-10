-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "closingPrice" DECIMAL(18,2),
ADD COLUMN     "contract" TEXT,
ADD COLUMN     "previousClosingPrice" DECIMAL(18,2),
ADD COLUMN     "priceChange" TEXT,
ADD COLUMN     "snapshotDate" TIMESTAMP(3),
ADD COLUMN     "tradedValue" DECIMAL(18,2),
ADD COLUMN     "tradedVolume" DECIMAL(18,2);
