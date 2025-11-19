/*
  Warnings:

  - The `difficultyLevel` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "QuizDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "difficultyLevel",
ADD COLUMN     "difficultyLevel" "QuizDifficulty" NOT NULL DEFAULT 'MEDIUM';
