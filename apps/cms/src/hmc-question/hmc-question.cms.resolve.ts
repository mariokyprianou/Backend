import { HmcQuestion, HmcQuestionService } from '@lib/power/hmc-question';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

interface HmcQuestionGraphQlType {
  id: string;
  orderIndex: number;
  localisations: HmcQuestionLocalisationGraphQlType[];
  programmeScores: HmcProgrammeScoreGraphQlType[];
}

// TODO: move to common
export interface HmcQuestionGraphQlInput {
  orderIndex: number;
  localisations: HmcQuestionLocalisationGraphQlType[];
  programmeScores: HmcProgrammeScoreGraphQlInput[];
}

interface HmcQuestionLocalisationGraphQlType {
  language: string;
  question: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
}

interface HmcProgrammeScoreGraphQlType {
  program: any; // TODO
  answer1: number;
  answer2: number;
  answer3: number;
  answer4: number;
}

interface HmcProgrammeScoreGraphQlInput {
  programmeId: string;
  answer1: number;
  answer2: number;
  answer3: number;
  answer4: number;
}

@Resolver('HmcQuestion')
export class HmcQuestionResolver {
  constructor(private readonly service: HmcQuestionService) {}

  @Query('allHmcQuestions')
  async allHmcQuestions(): Promise<HmcQuestionGraphQlType[]> {
    return (await this.service.findAll()).map(
      hmcQuestionModelToHmcQuestionGraphQL,
    );
  }

  @Mutation('createHmcQuestion')
  async createHmcQuestion(
    @Args('input') input: HmcQuestionGraphQlInput,
  ): Promise<HmcQuestionGraphQlType> {
    const hmcQuestion = await this.service.create(input);

    console.log(hmcQuestion);

    return hmcQuestion
      ? hmcQuestionModelToHmcQuestionGraphQL(hmcQuestion)
      : null;
  }
}

const hmcQuestionModelToHmcQuestionGraphQL = (
  hmcQuestionModel: HmcQuestion,
): HmcQuestionGraphQlType => {
  return {
    id: hmcQuestionModel.id,
    orderIndex: hmcQuestionModel.orderIndex,
    localisations: [],
    programmeScores: [],
  };
};
