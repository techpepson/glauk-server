-- DropForeignKey
ALTER TABLE "public"."CourseSlides" DROP CONSTRAINT "CourseSlides_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Courses" DROP CONSTRAINT "Courses_userId_fkey";

-- AddForeignKey
ALTER TABLE "Courses" ADD CONSTRAINT "Courses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSlides" ADD CONSTRAINT "CourseSlides_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
