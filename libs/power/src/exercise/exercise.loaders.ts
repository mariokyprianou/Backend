import { WorkoutExercise } from '@lib/power';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import * as DataLoader from 'dataloader';
import { ref } from 'objection';

@Injectable({ scope: Scope.REQUEST })
export class ExerciseLoaders {
  private readonly language: string;

  constructor(@Inject(CONTEXT) context: { language: string }) {
    this.language = context.language ?? 'en';
  }

  public readonly findByWorkoutId = new DataLoader<string, WorkoutExercise[]>(
    async (workoutIds) => {
      const exercises = await WorkoutExercise.query()
        .whereIn('workout_id', workoutIds as string[])
        .withGraphJoined('[localisations,exercise.localisations]')
        .modifyGraph('localisations', (qb) =>
          qb.where(ref('language'), this.language),
        )
        .modifyGraph('exercise.localisations', (qb) =>
          qb.where(ref('language'), this.language),
        )
        .withGraphFetched('sets');

      return workoutIds.map((id) =>
        exercises.filter((e) => e.workoutId === id),
      );
    },
  );
}
