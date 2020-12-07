import { Args, Query, Resolver } from '@nestjs/graphql';
import { FeedbackFilter, FeedbackService } from '@lib/power/feedback';
import { ListMetadata } from '@lib/power/types';

@Resolver('Feedback')
export class FeedbackResolver {
  constructor(private readonly service: FeedbackService) {}

  @Query('Feedback')
  async Feedback(@Args('id') id): Promise<FeedbackGraphQlType> {
    return await this.service.findById(id);
  }

  @Query('allFeedbacks')
  async allFeedbacks(
    @Args('page') page = 0,
    @Args('perPage') perPage = 25,
    @Args('sortField') sortField = 'created_at',
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Args('filter') filter: FeedbackFilter = {},
  ): Promise<FeedbackGraphQlType[]> {
    const findAllQuery = this.service.findAll(
      page,
      perPage,
      sortField,
      sortOrder,
      filter,
    );

    return await findAllQuery;
  }

  @Query('_allFeedbacksMeta')
  async _allFeedbacksMeta(
    @Args('filter') filter: FeedbackFilter = {},
  ): Promise<ListMetadata> {
    return {
      count: await this.service.findAllMeta(filter),
    };
  }
}

interface FeedbackGraphQlType {
  id: string;
}
