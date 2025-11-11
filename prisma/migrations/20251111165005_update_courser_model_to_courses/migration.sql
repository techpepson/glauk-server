/*
  Warnings:

  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CourseSlides" DROP CONSTRAINT "CourseSlides_courseId_fkey";

-- DropTable
DROP TABLE "public"."Course";

-- CreateTable
CREATE TABLE "Courses" (
    "id" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "courseDescription" TEXT,
    "courseCode" TEXT NOT NULL,
    "courseCredits" INTEGER NOT NULL,
    "courseGrades" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "courseGradePoints" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "courseInstructorEmail" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Courses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Courses" ADD CONSTRAINT "Courses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSlides" ADD CONSTRAINT "CourseSlides_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
