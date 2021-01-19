import {
  AuthContext,
  CompleteWorkout,
  ExerciseNote,
  ExerciseWeight,
  WorkoutOrder,
} from '@lib/power/types';
import { UserExerciseHistoryService } from '@lib/power/user-exercise-history/user-exercise-history.service';
import { UserExerciseNoteService } from '@lib/power/user-exercise-note/user-exercise-note.service';
import { UserPowerService } from '@lib/power/user-power';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver('UserProgramme')
export class UserProgrammeResolver {
  constructor(
    private userPower: UserPowerService,
    private userExerciseHistory: UserExerciseHistoryService,
    private userExerciseNote: UserExerciseNoteService,
  ) {}

  @Query('getProgramme')
  async userProgramme(
    @Context('authContext') authContext: AuthContext,
    @Context('language') language: string,
  ) {
    return this.userPower.currentUserProgramme(authContext.sub, language);
  }

  @Query('getExerciseWeight')
  async getExerciseWeight(
    @Args('exercise') exercise: string,
    @Context('authContext') authContext: AuthContext,
  ): Promise<ExerciseWeight[]> {
    return this.userExerciseHistory.findByExercise(exercise, authContext.sub);
  }

  @Mutation('updateOrder')
  async updateOrder(
    @Context('authContext') authContext: AuthContext,
    @Args('input') input: WorkoutOrder[],
  ): Promise<boolean> {
    return this.userPower.updateOrder(input, authContext.sub);
  }

  @Mutation('addExerciseWeight')
  async addExerciseWeight(
    @Args('input') input: ExerciseWeight,
    @Context('authContext') authContext: AuthContext,
  ): Promise<ExerciseWeight> {
    return this.userExerciseHistory.addHistory(input, authContext.sub);
  }

  @Mutation('completeWorkout')
  async completeWorkout(
    @Args('input') input: CompleteWorkout,
    @Context('authContext') authContext: AuthContext,
  ) {
    return this.userPower.completeWorkout(input, authContext.sub);
  }

  @Mutation('completeWorkoutWeek')
  async completeWorkoutWeek(@Context('authContext') authContext: AuthContext) {
    return this.userPower.completeWorkoutWeek(authContext.sub);
  }

  @Mutation('updateExerciseNote')
  async updateExerciseNote(
    @Context('authContext') authContext: AuthContext,
    @Args('input') input: ExerciseNote,
  ) {
    return this.userExerciseNote.addExerciseNote(input, authContext.sub);
  }
}
