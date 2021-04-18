/*
 * Author: Joseph Clough (joseph.clough@thedistance.co.uk)
 * Created: Fri, 22nd January 212021
 * Copyright 2021 - The Distance
 */

import { ListMetadata, ProgrammeEnvironment } from '@lib/power/types';
import {
  UserWorkoutFeedbackFilter,
  WorkoutFeedbackService,
} from '@lib/power/feedback';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CmsParams } from '@lib/common';

@Resolver('Feedback')
export class FeedbackResolver {
  constructor(private feedbackService: WorkoutFeedbackService) {}
  @Query('allFeedbacks')
  async allFeedbacks(
    @Args() params: CmsParams<UserWorkoutFeedbackFilter>,
  ): Promise<Feedback[]> {
    return this.feedbackService.findAll(params);
  }

  @Query('_allFeedbacksMeta')
  async allMeta(
    @Args() params: CmsParams<UserWorkoutFeedbackFilter>,
  ): Promise<ListMetadata> {
    return this.feedbackService.findCount(params);
  }

  @Query('Feedback')
  async feedback(@Args('id') id: string) {
    return this.feedbackService.findById(id);
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
