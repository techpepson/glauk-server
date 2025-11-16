/*
https://docs.nestjs.com/providers#services
*/

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

import * as fs from 'fs';
import parsePptx from 'pptx-parser';
import { PrismaService } from '../prisma/prisma.service';
import { HelpersService } from '../helpers/helpers.service';
import { QuizDto } from '../dto/quiz.dto';
import { QuestionType, QuizDifficulty } from '../enum/enum';

@Injectable()
export class QuizService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: HelpersService,
  ) {}

  async genQuerateQuizFromPDF(
    file: Express.Multer.File,
    email: string,
    payload: QuizDto,
  ) {
    try {
      const user = (await this.helpers.userExist(email)).user;

      //check if user exists
      if (!user) {
        throw new NotFoundException('User not found');
      }

      //check if user has enough credits
      const userCredits = user.totalCredits;

      //throw an error of user credits are less than number of questions
      if (userCredits < payload.numberOfQuestions) {
        throw new PreconditionFailedException(
          'Your credits are not sufficient to generate this quiz.',
        );
      }

      //upload file to supabase
      const fileUrl = (await this.helpers.parseFileToSupabase(file, email))
        .publicUrl;
        

      //upload slides to AI model to generate quiz
    } catch (error) {}
  }
}
