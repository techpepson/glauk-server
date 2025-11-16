import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { QuestionType, QuizDifficulty } from '../enum/enum';

export class QuizDto {
  @IsString()
  @IsNotEmpty()
  courseArea: string;

  @IsString()
  @IsNotEmpty()
  difficultyLevel: QuizDifficulty;

  @IsString()
  @IsNotEmpty()
  course: string;

  @IsString()
  @IsNotEmpty()
  questionType: QuestionType;

  @IsNumber()
  @IsNotEmpty()
  numberOfQuestions: number;

  @IsString()
  @IsOptional()
  additionalNotes: string;
}
