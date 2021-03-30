import {
  HmcQuestionLocalisationGraphQlType,
  ProgrammeEnvironment,
} from '@lib/power/types';
import { HmcQuestionService, QuestionAnswer } from '@lib/power';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProgrammeService } from '@lib/power/programme';

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
    @Context('language') language: string,
    @Args('input')
    input: {
      answers: SubmitPQInput[];
      environment: ProgrammeEnvironment;
    },
  ) {
    const { answers, environment } = input;
    const programmeId = await this.questionService.calculateProgrammeScores(
      answers,
      environment,
    );
    if (!programmeId) {
      return { programme: null };
    }

    // resolve the programme data
    const programme = await this.programmeService.findById(
      programmeId,
      language,
    );

    return { programme };
  }
}

interface ProgrammeQuestionnaire {
  id: string;
  orderIndex: number;
  question: HmcQuestionLocalisationGraphQlType;
}

interface SubmitPQInput {
  question: string;
  answer: QuestionAnswer;
}
