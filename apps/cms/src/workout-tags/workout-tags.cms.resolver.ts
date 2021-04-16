import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CmsParams, ICmsFilter } from '@lib/common';
import {
  TaxonomyCmsService,
  CreateTaxonomyTermDto,
  UpdateTaxonomyTermDto,
} from '@lib/taxonomy';

@Resolver('WorkoutTag')
export class WorkoutTagCmsResolver {
  constructor(private readonly taxonomyService: TaxonomyCmsService) {}

  @Query('WorkoutTag')
  getWorkoutTag(@Args('id', ParseUUIDPipe) id: string) {
    return this.taxonomyService.findTermById(id);
  }

  @Query('allWorkoutTags')
  getAllWorkoutTags(@Args() params: CmsParams<ICmsFilter>) {
    return this.taxonomyService.findAllTerms(params);
  }

  @Query('_allWorkoutTagsMeta')
  getAllWorkoutTagsMeta(@Args() params: CmsParams<ICmsFilter>) {
    return this.taxonomyService.findTermCount(params);
  }

  @Mutation('createWorkoutTag')
  createWorkoutTag(@Args() params: CreateTaxonomyTermDto) {
    return this.taxonomyService.createTerm('workout-tag', params);
  }

  @Mutation('updateWorkoutTag')
  updateWorkoutTag(@Args() params: UpdateTaxonomyTermDto) {
    return this.taxonomyService.updateTerm(params);
  }

  @Mutation('deleteWorkoutTag')
  deleteWorkoutTag(@Args('id', ParseUUIDPipe) id: string) {
    return this.taxonomyService.deleteTermById(id);
  }
}
