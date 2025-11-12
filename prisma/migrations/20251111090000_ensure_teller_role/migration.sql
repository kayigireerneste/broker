-- Ensure the Role enum contains the TELLER value
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'TELLER';
