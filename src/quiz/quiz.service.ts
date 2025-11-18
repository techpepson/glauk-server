/*
https://docs.nestjs.com/providers#services
*/

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

import * as fs from 'fs';
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

  async generateQuizFromPDF(
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

      const parseToText = await this.helpers.parseFileToText(file, email);

      const chunkedText = parseToText?.chunkText ?? [];

      //upload slides to AI model to generate quiz
      const aIRequest = await this.helpers.makeRequestToAIModel(
        payload.numberOfQuestions,
        payload.questionType,
        chunkedText,
        payload.additionalNotes,
        payload.difficultyLevel,
      );

      console.log(aIRequest);

      return {
        response: aIRequest,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof PreconditionFailedException) {
        throw new PreconditionFailedException(error.message);
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }
}
