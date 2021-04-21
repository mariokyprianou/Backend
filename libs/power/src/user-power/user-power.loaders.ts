import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { Account } from '../account';
import { UserExerciseNote } from '../user-exercise-note';
import { UserWorkout } from '../user-workout';
import { UserWorkoutWeek } from '../user-workout-week';
import { Workout } from '../workout';
import { WorkoutExercise } from '../workout/workout-exercise.model';

@Injectable({ scope: Scope.REQUEST })
export class UserPowerLoaders {
  private async findWeeksByAccountId(
    accountId: string,
  ): Promise<UserWorkoutWeek> {
    return Account.relatedQuery<UserWorkoutWeek>('currentWorkoutWeeks')
      .for(accountId)
      .whereNull('completed_at')
      .orderBy('created_at', 'DESC')
      .limit(1)
      .first();
  }

  public readonly findUserCurrentWeek = new DataLoader<string, UserWorkoutWeek>(
    async (accountIds) => {
      const queries = accountIds.map((accountId) =>
        this.findWeeksByAccountId(accountId),
      );
      return Promise.all(queries);
    },
  );

  public readonly findUserWorkoutsByWeekId = new DataLoader<
    string,
    UserWorkout[]
  >(async (workoutWeekIds) => {
    const workouts = await UserWorkoutWeek.relatedQuery('workouts')
      .alias('userWorkout')
      .withGraphJoined('workout.localisations')
      .for(workoutWeekIds as string[])
      .orderBy(['userWorkout.id', 'userWorkout.order_index']);
    return workoutWeekIds.map((id) =>
      workouts.filter((workout) => workout.userWorkoutWeekId === id),
    );
  });

  public readonly findExerciseByWorkoutId = new DataLoader<
    string,
    WorkoutExercise[]
  >(async (workoutIds) => {
    const exercises = await Workout.relatedQuery('exercises')
      .alias('exercises')
      .for(workoutIds as string[])
      .withGraphFetched(`[sets, localisations, exercise.[localisations]]`)
      .orderBy(['exercises.id', 'exercises.order_index']);
    return workoutIds.map((id) =>
      exercises.filter((exercise) => exercise.workoutId === id),
    );
  });

  public readonly findUserNoteByAccountAndExercise = new DataLoader<
    [accountId: string, exerciseId: string],
    UserExerciseNote
  >(async (ids) => {
    const query = UserExerciseNote.query();

    ids.forEach(([accountId, exerciseId]) => {
      query.orWhere((qb) =>
        qb.where('account_id', accountId).andWhere('exercise_id', exerciseId),
      );
    });

    const notes = await query;

    return ids.map(([accountId, exerciseId]) =>
      notes.find(
        (note) =>
          note.accountId === accountId && note.exerciseId === exerciseId,
      ),
    );
  });
}
