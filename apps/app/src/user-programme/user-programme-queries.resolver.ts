import {
  AuthContext,
  ExerciseNote,
  ExerciseWeight,
  WorkoutOrder,
} from '@lib/power/types';
import { UserExerciseHistoryService } from '@lib/power/user-exercise-history/user-exercise-history.service';
import { UserExerciseNoteService } from '@lib/power/user-exercise-note/user-exercise-note.service';
import { UserPowerService } from '@lib/power/user-power';
import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CompleteWorkoutInputDto } from './dto/complete-workout.dto';

@Resolver()
export class UserProgrammeQueryResolver {
  constructor(
    private userPowerService: UserPowerService,
    private exerciseHistoryService: UserExerciseHistoryService,
    private exerciseNoteService: UserExerciseNoteService,
  ) {}

  @Query('getProgramme')
  async userProgramme(@Context('authContext') authContext: AuthContext) {
    return this.userPowerService.findCurrentProgramme(authContext.id);
  }

  @Query('getExerciseWeight')
  async getExerciseWeight(
    @Context('authContext') authContext: AuthContext,
    @Args('exercise', ParseUUIDPipe) excerciseId: string,
  ): Promise<ExerciseWeight[]> {
    const weightRecords = await this.exerciseHistoryService.findByExercise(
      excerciseId,
      authContext.sub,
    );

    return weightRecords.map((record) => ({
      id: record.id,
      exerciseId: record.exerciseId,
      weight: record.weight,
      reps: record.quantity,
      quantity: record.quantity,
      setNumber: record.setNumber,
      setType: record.setType,
      createdAt: record.createdAt,
    }));
  }

  @Mutation('updateOrder')
  async updateOrder(
    @Context('authContext') authContext: AuthContext,
    @Args('input') input: WorkoutOrder[],
  ): Promise<boolean> {
    return this.userPowerService.updateOrder(input, authContext.sub);
  }

  @Mutation('completeWorkout')
  async completeWorkout(
    @Args('input') input: CompleteWorkoutInputDto,
    @Context('authContext') authContext: AuthContext,
  ) {
    return this.userPowerService.completeWorkout(input, authContext.sub);
  }

  @Mutation('completeWorkoutWeek')
  async completeWorkoutWeek(@Context('authContext') authContext: AuthContext) {
    return this.userPowerService.completeWorkoutWeek(authContext.id);
  }

  @Mutation('updateExerciseNote')
  async updateExerciseNote(
    @Context('authContext') authContext: AuthContext,
    @Args('input') input: ExerciseNote,
  ) {
    return this.exerciseNoteService.addExerciseNote(input, authContext.sub);
  }

  @Mutation('continueProgramme')
  async continueProgramme(
    @Args('input') input: { programme: string },
    @Context('authContext') authContext: AuthContext,
  ) {
    return this.userPowerService.continueProgramme(
      input.programme,
      authContext,
    );
  }

  @Mutation('startProgramme')
  async startProgramme(
    @Args('input') input: { programme: string },
    @Context('authContext') authContext: AuthContext,
  ) {
    return this.userPowerService.startProgramme({
      accountId: authContext.id,
      trainingProgrammeId: input.programme,
    });
  }

  @Mutation('restartProgramme')
  async restartProgramme(
    @Args('input') input: { programme: string },
    @Context('authContext') authContext: AuthContext,
  ) {
    return this.userPowerService.restartProgramme({
      accountId: authContext.id,
      trainingProgrammeId: input.programme,
    });
  }
}
