import { WorkoutExercise } from '@lib/power';
import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class ExerciseCmsLoaders {
  public readonly findByWorkoutId = new DataLoader<string, WorkoutExercise[]>(
    async (workoutIds) => {
      const exercises = await WorkoutExercise.query()
        .whereIn('workout_id', workoutIds as string[])
        .withGraphJoined('exercise')
        .withGraphFetched('[sets, localisations, exercise.localisations]');
      return workoutIds.map((id) =>
        exercises.filter((e) => e.workoutId === id),
      );
    },
  );
}
