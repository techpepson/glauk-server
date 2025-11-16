/*
  Warnings:

  - Added the required column `courseArea` to the `CourseSlides` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slideUrl` to the `CourseSlides` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CourseSlides` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CourseSlides" ADD COLUMN     "courseArea" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "slideUrl" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "totalCredits" SET DEFAULT 30;

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "content" TEXT,
    "options" TEXT[],
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "difficultyLevel" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "numberOfQuestionsGenerated" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseSlidesId" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_courseSlidesId_fkey" FOREIGN KEY ("courseSlidesId") REFERENCES "CourseSlides"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
