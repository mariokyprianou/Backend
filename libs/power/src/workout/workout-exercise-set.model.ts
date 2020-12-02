/*
 * Author: Joseph Clough (joseph.clough@thedistance.co.uk)
 * Created: Wed, 2nd December 202020
 * Copyright 2020 - The Distance
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { SetType } from '../types';

export class WorkoutExerciseSet extends BaseModel {
  static tableName = 'workout_exercise_set';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  workoutExerciseId: string;
  setNumber: number;
  quantity: number;
  restTime: number;
}
