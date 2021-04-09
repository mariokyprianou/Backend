import { HmcQuestionLocalisationGraphQlType } from '@lib/power/types';
import { HmcQuestionService, Programme } from '@lib/power';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProgrammeService } from '@lib/power/programme';
import { SubmitProgrammeQuestionnaireDto } from './dto/submit-programme-questionnaire-input.dto';

@Resolver('ProgrammeQuestion')
export class HMCResolver {
  constructor(
    private questionService: HmcQuestionService,
    private programmeService: ProgrammeService,
  ) {}

  @Query('programmeQuestionnaire')
  async programmeQuestionnaire(
    @Context('language') language: string,
  ): Promise<ProgrammeQuestionnaire[]> {
    const questionnaire = await this.questionService.findAllQuestions(language);
    return questionnaire.map((question) => ({
      id: question.id,
      orderIndex: question.orderIndex,
      question: question.localisations[0],
    }));
  }

  @Mutation('submitProgrammeQuestionnaire')
  async submitProgrammeQuestionnaire(
    @Args('input')
    input: SubmitProgrammeQuestionnaireDto,
  ): Promise<{ programme: Programme | null }> {
    const { answers, environment } = input;
    const programmeId = await this.questionService.calculateProgrammeScores(
      answers,
      environment,
    );

    if (!programmeId) {
      return { programme: null };
    }

    // resolve the programme data
    const programme = await this.programmeService.findById(programmeId);

    return { programme };
  }
}

interface ProgrammeQuestionnaire {
  id: string;
  orderIndex: number;
  question: HmcQuestionLocalisationGraphQlType;
}
