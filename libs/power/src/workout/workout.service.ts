import { Injectable } from '@nestjs/common';
import { Transaction } from 'objection';
import { IWorkout, SetType } from './workout.interface';
import { Workout } from './workout.model';

function ensureExercisesAreTimeBased(params: IWorkout) {
  for (const exercise of params.exercises) {
    if (exercise.setType !== SetType.TIME) {
      throw new Error(
        'All exercises must be time-based in a continuous workout.',
      );
    }
  }
}

@Injectable()
export class WorkoutService {
  public async createWorkout(
    params: IWorkout,
    opts: { transaction: Transaction },
  ) {
    if (params.isContinuous) {
      ensureExercisesAreTimeBased(params);
    }

    return Workout.query(opts.transaction).insertGraph(
      {
        isContinuous: params.isContinuous,
        trainingProgrammeId: params.programme,
        overviewImageKey: params.overviewImageKey,
        intensity: params.intensity,
        duration: params.duration,
        localisations: params.localisations,
        exercises: params.exercises.map((exercise) => ({
          exerciseId: exercise.exercise,
          setType: exercise.setType,
          orderIndex: exercise.orderIndex,
          localisations: exercise.localisations,
          sets: exercise.sets.map((set) => ({
            setNumber: set.setNumber,
            quantity: set.quantity,
            restTime: set.restTime,
          })),
        })),
        tags: (params.tagIds ?? []).map((id) => ({
          id,
        })),
      },
      { relate: true },
    );
  }
}
