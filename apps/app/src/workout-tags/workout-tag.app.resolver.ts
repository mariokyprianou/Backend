/* eslint-disable @typescript-eslint/no-unused-vars */
import { Context, Query, Resolver } from '@nestjs/graphql';
import { TaxonomyService } from '@lib/taxonomy';

@Resolver('WorkoutTag')
export class WorkoutTagResolver {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Query('workoutTags')
  async getTags(@Context('language') language: string) {
    return this.taxonomyService.findTerms('workout-tag', { language });
  }
}
