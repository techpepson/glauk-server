/*
  Warnings:

  - The `completionStatus` column on the `CourseSlides` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `questionType` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CompletionStatus" AS ENUM ('PENDING', 'COMPLETED', 'PROGRESS', 'RETAKE_RECOMMENDED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILL_IN_THE_BLANK');

-- AlterTable
ALTER TABLE "CourseSlides" DROP COLUMN "completionStatus",
ADD COLUMN     "completionStatus" "CompletionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "questionType",
ADD COLUMN     "questionType" "QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE';

-- DropEnum
DROP TYPE "public"."COMPLETIONSTATUS";

-- DropEnum
DROP TYPE "public"."QUESTIONTYPE";
