/*
  Warnings:

  - Made the column `currentGpa` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalCredits` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "currentGpa" SET NOT NULL,
ALTER COLUMN "totalCredits" SET NOT NULL;
