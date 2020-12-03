import {
  HmcQuestion,
  HmcQuestionScore,
  HmcQuestionService,
  HmcQuestionTranslation,
} from '@lib/power/hmc-question';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

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
    localisations: hmcQuestionModel.translations.map(
      hmcQuestionTranslationModelToHmcQuestionLocalisationGraphQlType,
    ),
    programmeScores: hmcQuestionModel.scores.map(
      hmcQuestionScoreModelToHmcProgrammeScoreGraphQlType,
    ),
  };
};

const hmcQuestionTranslationModelToHmcQuestionLocalisationGraphQlType = (
  hmcQuestionTranslationModel: HmcQuestionTranslation,
): HmcQuestionLocalisationGraphQlType => {
  return {
    language: hmcQuestionTranslationModel.language,
    question: hmcQuestionTranslationModel.question,
    answer1: hmcQuestionTranslationModel.answer1,
    answer2: hmcQuestionTranslationModel.answer2,
    answer3: hmcQuestionTranslationModel.answer3,
    answer4: hmcQuestionTranslationModel.answer4,
  };
};

const hmcQuestionScoreModelToHmcProgrammeScoreGraphQlType = (
  hmcQuestionScoreModel: HmcQuestionScore,
): HmcProgrammeScoreGraphQlType => {
  return {
    programId: hmcQuestionScoreModel.trainingProgrammeId,
    answer1: hmcQuestionScoreModel.answer1Score,
    answer2: hmcQuestionScoreModel.answer2Score,
    answer3: hmcQuestionScoreModel.answer3Score,
    answer4: hmcQuestionScoreModel.answer4Score,
  };
};

interface HmcQuestionGraphQlType {
  id: string;
  orderIndex: number;
  localisations: HmcQuestionLocalisationGraphQlType[];
  programmeScores: HmcProgrammeScoreGraphQlType[];
}

// TODO: move to common?
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
  programId: string;
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
