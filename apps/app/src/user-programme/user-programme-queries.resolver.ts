import { ExerciseNote, ExerciseWeight, WorkoutOrder } from '@lib/power/types';
import { UserExerciseHistoryService } from '@lib/power/user-exercise-history/user-exercise-history.service';
import { UserExerciseNoteService } from '@lib/power/user-exercise-note/user-exercise-note.service';
import { UserPowerService, CompleteWorkoutDto } from '@lib/power';
import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from '../context';

@Resolver()
export class UserProgrammeQueryResolver {
  constructor(
    private userPowerService: UserPowerService,
    private exerciseHistoryService: UserExerciseHistoryService,
    private exerciseNoteService: UserExerciseNoteService,
  ) {}

  @Query('getProgramme')
  async userProgramme(@User() user: User) {
    return this.userPowerService.findCurrentProgramme(user.id);
  }

  @Query('getExerciseWeight')
  async getExerciseWeight(
    @User() user: User,
    @Args('exercise', ParseUUIDPipe) excerciseId: string,
  ): Promise<ExerciseWeight[]> {
    const weightRecords = await this.exerciseHistoryService.findByExercise({
      accountId: user.id,
      exerciseId: excerciseId,
    });

    return weightRecords.map((record) => ({
      id: record.id,
      exerciseId: record.exerciseId,
      weight: record.weight,
      reps: record.quantity,
      quantity: record.quantity,
      setNumber: record.setNumber,
      setType: record.setType,
      createdAt: record.completedAt ?? record.createdAt,
    }));
  }

  @Mutation('updateOrder')
  async updateOrder(@Args('input') input: WorkoutOrder[]): Promise<boolean> {
    return this.userPowerService.updateOrder(input);
  }

  @Mutation('completeWorkout')
  async completeWorkout(
    @Args('input') input: CompleteWorkoutDto,
    @User() user: User,
  ): Promise<{ success: boolean }> {
    return this.userPowerService.completeWorkout(user.id, input);
  }

  @Mutation('completeWorkoutWeek')
  async completeWorkoutWeek(@User() user: User) {
    return this.userPowerService.completeWorkoutWeek(user.id);
  }

  @Mutation('updateExerciseNote')
  async updateExerciseNote(
    @User() user: User,
    @Args('input') input: ExerciseNote,
  ) {
    return this.exerciseNoteService.addExerciseNote(input, user.sub);
  }

  @Mutation('continueProgramme')
  async continueProgramme(
    @Args('input') input: { programme: string },
    @User() user: User,
  ) {
    return this.userPowerService.continueProgramme({
      accountId: user.id,
      trainingProgrammeId: input.programme,
    });
  }

  @Mutation('startProgramme')
  async startProgramme(
    @Args('input') input: { programme: string },
    @User() user: User,
  ) {
    return this.userPowerService.startProgramme({
      accountId: user.id,
      trainingProgrammeId: input.programme,
    });
  }

  @Mutation('restartProgramme')
  async restartProgramme(
    @Args('input') input: { programme: string },
    @User() user: User,
  ) {
    return this.userPowerService.restartProgramme({
      accountId: user.id,
      trainingProgrammeId: input.programme,
    });
  }
}
