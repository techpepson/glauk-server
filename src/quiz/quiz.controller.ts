/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller } from '@nestjs/common';
import { QuizService } from './quiz.service';
import * as pdfParse from 'pdf-parse';
import * as pptxParser from 'pptx-parser';
import * as fs from 'fs';
@Controller()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  async generateQuiz(file: Express.Multer.File) {}

  async deleteSavedQuiz() {
    // Implementation for deleting a saved quiz will go here
  }
}
