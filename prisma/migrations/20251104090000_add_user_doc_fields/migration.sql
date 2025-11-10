-- Add document fields and agent-client relationship tracking to User
ALTER TABLE "User"
    ADD COLUMN "csdNumber" TEXT,
    ADD COLUMN "passportPhoto" TEXT,
    ADD COLUMN "idDocument" TEXT,
    ADD COLUMN "createdById" TEXT;

ALTER TABLE "User"
    ADD CONSTRAINT "User_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
