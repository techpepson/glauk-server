/*
  Warnings:

  - You are about to drop the column `correctAnswer` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `explanation` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `Question` table. All the data in the column will be lost.
  - The `content` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `correctAnswers` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "correctAnswer",
DROP COLUMN "explanation",
DROP COLUMN "options",
ADD COLUMN     "correctAnswers" INTEGER NOT NULL,
ADD COLUMN     "obtainedGPT" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "obtainedGrade" TEXT NOT NULL DEFAULT 'X',
ADD COLUMN     "remarks" TEXT,
DROP COLUMN "content",
ADD COLUMN     "content" JSONB;
