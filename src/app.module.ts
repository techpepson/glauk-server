import { QuizModule } from './quiz/quiz.module';
import { CoursesService } from './courses/courses.service';
import { CourseModule } from './courses/courses.module';
import { CoursesController } from './courses/courses.controller';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import authConfig from './config/app.config';
import { HelpersModule } from './helpers/helpers.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaService } from './prisma/prisma.service';
import { HelpersService } from './helpers/helpers.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 1024 * 1024 * 50,
      },
    }),
    QuizModule,
    CourseModule,
    CacheModule.register(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'auth',
          ttl: 60000,
          limit: 5,
        },
      ],
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAILER_HOST,
        port: parseInt(process.env.MAILER_PORT?.toString() || '465'),
        secure: true,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASS,
        },
      },
      defaults: {
        from: `"The Glauk Team" <${process.env.MAILER_DEFAULT_FROM}>`,
      },
      preview: false,
      template: {
        dir: join(__dirname, '..', 'views'),
        adapter: new HandlebarsAdapter(),
      },
    }),
    HelpersModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig],
    }),
  ],
  controllers: [CoursesController, AppController],
  providers: [CoursesService, AppService, PrismaService, HelpersService],
})
export class AppModule {}
