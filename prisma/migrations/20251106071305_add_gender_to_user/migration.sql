/*
  Warnings:

  - A unique constraint covering the columns `[csdNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gender" TEXT NOT NULL DEFAULT 'male';

-- CreateIndex
CREATE UNIQUE INDEX "User_csdNumber_key" ON "User"("csdNumber");
