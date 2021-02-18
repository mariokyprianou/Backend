/*
 * Author: Joseph Clough (joseph.clough@thedistance.co.uk)
 * Created: Wed, 17th February 212021
 * Copyright 2021 - The Distance
 */

import { BaseModel } from '@lib/database';
import { snakeCaseMappers } from 'objection';

export class WorkoutExerciseTranslation extends BaseModel {
  static tableName = 'workout_exercise_tr';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  workoutExerciseId: string;
  language: string;
  coachingTips: string;
  createdAt: Date;
  updatedAt: Date;
}
