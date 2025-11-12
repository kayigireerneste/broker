-- Merge first and last name fields into fullName and relax optional profile columns
ALTER TABLE "User"
    ADD COLUMN "fullName" TEXT;

UPDATE "User"
SET "fullName" = TRIM(BOTH ' ' FROM COALESCE(NULLIF("firstName", ''), '') ||
                                CASE
                                  WHEN COALESCE(NULLIF("firstName", ''), '') <> ''
                                       AND COALESCE(NULLIF("lastName", ''), '') <> ''
                                    THEN ' '
                                  ELSE ''
                                END ||
                                COALESCE(NULLIF("lastName", ''), ''))
WHERE "fullName" IS NULL;

UPDATE "User"
SET "fullName" = 'New User'
WHERE "fullName" IS NULL OR "fullName" = '';

ALTER TABLE "User"
    ALTER COLUMN "fullName" SET NOT NULL,
    ALTER COLUMN "idNumber" DROP NOT NULL,
    ALTER COLUMN "dateOfBirth" DROP NOT NULL,
    ALTER COLUMN "occupation" DROP NOT NULL,
    ALTER COLUMN "investmentExperience" DROP NOT NULL;

ALTER TABLE "User"
    DROP COLUMN IF EXISTS "firstName",
    DROP COLUMN IF EXISTS "lastName";
