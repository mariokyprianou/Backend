/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import type { TaxonomyTerm } from '@lib/taxonomy';
import type { WorkoutIntensity } from './workout.interface';
import type { Programme } from '../programme';
import type { WorkoutExercise } from './workout-exercise.model';
import type { WorkoutTranslation } from './workout-tr.model';

export class Workout extends BaseModel {
  static tableName = 'workout';

  id: string;
  isContinuous: boolean;
  trainingProgrammeId: string;
  overviewImageKey: string;
  intensity: WorkoutIntensity;
  duration: number;
  createdAt: Date;
  updatedAt: Date;

  localisations: WorkoutTranslation[];
  exercises: WorkoutExercise[];
  trainingProgramme: Programme;
  tags: TaxonomyTerm[];

  public getTranslation(language: string) {
    return (this.localisations ?? []).find((tr) => tr.language === language);
  }

  static get relationMappings() {
    const { Programme } = require('../programme/programme.model');
    const { WorkoutTranslation } = require('./workout-tr.model');
    const { WorkoutExercise } = require('./workout-exercise.model');
    const { TaxonomyTerm } = require('@lib/taxonomy');
    return {
      localisations: {
        relation: BaseModel.HasManyRelation,
        modelClass: WorkoutTranslation,
        join: {
          from: 'workout.id',
          to: 'workout_tr.workout_id',
        },
      },
      exercises: {
        relation: BaseModel.HasManyRelation,
        modelClass: WorkoutExercise,
        join: {
          from: 'workout.id',
          to: 'workout_exercise.workout_id',
        },
      },
      trainingProgramme: {
        relation: BaseModel.HasOneRelation,
        modelClass: Programme,
        join: {
          from: 'workout.training_programme_id',
          to: 'training_programme.id',
        },
      },
      tags: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: TaxonomyTerm,
        join: {
          from: 'workout.id',
          through: {
            from: 'workout_tag.workout_id',
            to: 'workout_tag.taxonomy_term_id',
          },
          to: 'taxonomy_term.id',
        },
      },
    };
  }
}
