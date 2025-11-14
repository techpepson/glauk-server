/*
  Warnings:

  - A unique constraint covering the columns `[courseCode,userId]` on the table `Courses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Courses_courseCode_userId_key" ON "Courses"("courseCode", "userId");
