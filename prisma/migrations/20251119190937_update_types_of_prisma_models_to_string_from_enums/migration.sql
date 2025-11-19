/*
  Warnings:

  - The `completionStatus` column on the `CourseSlides` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `questionType` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `difficultyLevel` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CourseSlides" DROP COLUMN "completionStatus",
ADD COLUMN     "completionStatus" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "questionType",
ADD COLUMN     "questionType" TEXT NOT NULL DEFAULT 'multiple_choice',
DROP COLUMN "difficultyLevel",
ADD COLUMN     "difficultyLevel" TEXT NOT NULL DEFAULT 'medium';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'student';

-- DropEnum
DROP TYPE "public"."CompletionStatus";

-- DropEnum
DROP TYPE "public"."QuestionType";

-- DropEnum
DROP TYPE "public"."QuizDifficulty";

-- DropEnum
DROP TYPE "public"."Role";
