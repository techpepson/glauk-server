/*
  Warnings:

  - The `questionType` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "QUESTIONTYPE" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILL_IN_THE_BLANK');

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "questionType",
ADD COLUMN     "questionType" "QUESTIONTYPE" NOT NULL DEFAULT 'MULTIPLE_CHOICE';
