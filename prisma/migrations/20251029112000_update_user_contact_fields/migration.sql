-- AlterTable
ALTER TABLE "User"
ADD COLUMN "phoneCountryCode" TEXT,
ADD COLUMN "country" TEXT,
ADD COLUMN "city" TEXT,
DROP COLUMN "address";

-- Backfill existing rows if needed
UPDATE "User"
SET "phoneCountryCode" = '+250'
WHERE "phoneCountryCode" IS NULL;

UPDATE "User"
SET "country" = 'Rwanda'
WHERE "country" IS NULL;

UPDATE "User"
SET "city" = 'Kigali'
WHERE "city" IS NULL;

ALTER TABLE "User"
ALTER COLUMN "phoneCountryCode" SET NOT NULL,
ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL;
