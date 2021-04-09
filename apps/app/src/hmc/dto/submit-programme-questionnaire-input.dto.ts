import { ProgrammeEnvironment, QuestionnaireAnswer } from '@lib/power';
import { ArgsType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsIn, IsUUID, ValidateNested } from 'class-validator';

@ArgsType()
export class SubmitProgrammeQuestionnaireDto {
  @ValidateNested()
  @Type(() => ProgrammeQuestionAnswerDto)
  answers: ProgrammeQuestionAnswerDto[];

  @IsIn(Object.values(ProgrammeEnvironment))
  environment: ProgrammeEnvironment;
}

export class ProgrammeQuestionAnswerDto {
  @IsUUID()
  question: string;
  @IsIn(Object.values(QuestionnaireAnswer))
  answer: QuestionnaireAnswer;
}
