import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CourseDTO, CourseUpdateDTO } from '../dto/course.dto';
import { PrismaService } from '../prisma/prisma.service';
import { HelpersService } from '../helpers/helpers.service';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: HelpersService,
  ) {}

  async addCourse(payload: CourseDTO, userEmail: string) {
    try {
      const user = (await this.helpers.userExist(userEmail)).user;

      //check if user exists
      if (!user) {
        throw new NotFoundException('User not found');
      }

      //now add the course, through the user
      const course = await this.prisma.courses.create({
        data: {
          courseName: payload.courseName,
          courseDescription: payload.courseDescription,
          courseCode: payload.courseCode,
          courseCredits: payload.courseCredits,
          courseInstructorEmail: payload.courseInstructorEmail ?? '',
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      return {
        message: 'Course Added Successully',
        course,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async updateMultipleCourses(email: string, payload: CourseUpdateDTO[]) {
    try {
      const user = (await this.helpers.userExist(email)).user;

      if (!user) {
        throw new NotFoundException('User does not exist');
      }

      // Extract course IDs to update
      const courseIds = payload.map((c) => c.courseId);

      // Fetch only the courses owned by this user
      const existingCourses = await this.prisma.courses.findMany({
        where: {
          id: { in: courseIds },
          userId: user.id,
        },
      });

      // Verify that all provided IDs belong to the user
      const existingCourseIds = new Set(existingCourses.map((c) => c.id));
      const invalidCourses = payload.filter(
        (c) => !existingCourseIds.has(c.courseId),
      );

      if (invalidCourses.length > 0) {
        throw new BadRequestException(
          `You cannot update these courses: ${invalidCourses.map((c) => c.courseId).join(', ')}`,
        );
      }

      // Build Prisma update operations
      const updateOperations = payload.map((course) =>
        this.prisma.courses.update({
          where: { id: course.courseId },
          data: {
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            courseCredits: course.courseCredits,
            courseInstructorEmail: course.courseInstructorEmail,
          },
        }),
      );

      // Execute them atomically
      const updatedCourses = await this.prisma.$transaction(updateOperations);

      return {
        message: 'Courses updated successfully',
        updatedCourses,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else throw new InternalServerErrorException(error.message);
    }
  }

  async deleteCourse(email: string, courseId: string) {
    try {
      const user = (await this.helpers.userExist(email)).user;

      const course = await this.prisma.courses.findUnique({
        where: {
          id: courseId,
        },
      });

      if (!email) {
        throw new BadRequestException('Email is required to delete course');
      }
      if (!user) {
        throw new NotFoundException('User does not exist');
      }

      if (!course) {
        throw new NotFoundException('Course does not exist');
      }

      if (course.userId !== user.id) {
        throw new BadRequestException(
          "You cannot delete another user's course",
        );
      }

      await this.prisma.courses.delete({
        where: { id: courseId },
      });

      return { message: 'Course deleted successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new InternalServerErrorException(
          'An internal server error occurred while deleting course.',
        );
      }
    }
  }

  async fetchCourseData(email: string) {
    try {
      const user = (await this.helpers.userExist(email)).user;

      if (!user) {
        throw new NotFoundException('User does not exist');
      }

      const userWithCourses = await this.prisma.user.findUnique({
        where: { email },
        select: {
          userName: true,
          targetGpa: true,
          courses: true,
          currentGpa: true,
          profileImage: true,
        },
      });

      return {
        courses: userWithCourses?.courses,
        userName: userWithCourses?.userName,
        targetGpa: userWithCourses?.targetGpa,
        currentGpa: userWithCourses?.currentGpa,
        profileImage: userWithCourses?.profileImage,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }
}
