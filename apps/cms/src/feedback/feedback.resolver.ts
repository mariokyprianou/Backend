/*
 * Author: Joseph Clough (joseph.clough@thedistance.co.uk)
 * Created: Fri, 22nd January 212021
 * Copyright 2021 - The Distance
 */

import { ListMetadata, ProgrammeEnvironment } from '@lib/power/types';
import {
  UserWorkoutFeedbackFilter,
  UserWorkoutFeedbackService,
} from '@lib/power/feedback';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver('Feedback')
export class FeedbackResolver {
  constructor(private feedbackService: UserWorkoutFeedbackService) {}
  @Query('allFeedbacks')
  async allFeedbacks(
    @Args('page') page = 0,
    @Args('perPage') perPage = 25,
    @Args('sortField') sortField = 'created_at',
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Args('filter') filter: UserWorkoutFeedbackFilter = {},
  ): Promise<Feedback[]> {
    return this.feedbackService.all(
      page,
      perPage,
      sortField,
      sortOrder,
      filter,
    );
  }

  @Query('_allFeedbacksMeta')
  async allMeta(
    @Args('filter') filter: UserWorkoutFeedbackFilter = {},
  ): Promise<ListMetadata> {
    return this.feedbackService.count(filter);
  }

  @Query('Feedback')
  async feedback(@Args('id') id: string): Promise<Feedback> {
    return this.feedbackService.feedback(id);
  }

  @Mutation('exportFeedback')
  async export(): Promise<string> {
    return this.feedbackService.export();
  }
}

export interface Feedback {
  id: string;
  trainerName?: string;
  week?: number;
  workoutName: string;
  emojis: string[];
  userEmail: string;
  timeTaken?: number;
  workoutIntensity?: number;
  date?: Date;
  environment?: ProgrammeEnvironment;
}
