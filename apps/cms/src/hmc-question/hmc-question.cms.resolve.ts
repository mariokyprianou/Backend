import { HmcQuestion, HmcQuestionService } from '@lib/power/hmc-question';
import { Args, Query, Resolver } from '@nestjs/graphql';

interface HmcQuestionGraphQlType {
  id: string;
  localisations: any[];
  trainerScores: any[];
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
}

const hmcQuestionModelToHmcQuestionGraphQL = (
  hmcQuestionService: HmcQuestion,
): HmcQuestionGraphQlType => {
  return {
    id: hmcQuestionService.id,
    localisations: [],
    trainerScores: [],
  };
};
