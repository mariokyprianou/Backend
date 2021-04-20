/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { ProgrammeEnvironment, PublishStatus } from '../types';

import type { Challenge } from '../challenge';
import type { ProgrammeImage } from './programme-image.model';
import type { ProgrammeTranslation } from './programme-tr.model';
import type { ShareMedia } from './share-media.model';
import type { Trainer } from '../trainer';
import type { ScheduledWorkout } from '../scheduled-workout';
import type { OnDemandWorkout } from '../on-demand-workout';

export class Programme extends BaseModel {
  static tableName = 'training_programme';

  id: string;
  trainerId: string;
  environment: ProgrammeEnvironment;
  weeksAvailable: number;
  fitness: number;
  muscle: number;
  fatLoss: number;
  wellness: number;
  status: PublishStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

  // Relations
  trainer: Trainer;
  localisations: ProgrammeTranslation[];
  challenges: Challenge[];
  images: ProgrammeImage[];
  shareMediaImages: ShareMedia[];
  scheduledWorkouts?: ScheduledWorkout[];
  onDemandWorkouts?: OnDemandWorkout[];

  public getTranslation(language: string) {
    return (this.localisations ?? []).find((tr) => tr.language === language);
  }

  static get relationMappings() {
    const { Challenge } = require('../challenge');
    const { ProgrammeImage } = require('./programme-image.model');
    const { ProgrammeTranslation } = require('./programme-tr.model');
    const { ShareMedia } = require('./share-media.model');
    const { Trainer } = require('../trainer');
    const { OnDemandWorkout } = require('../on-demand-workout');
    const { ScheduledWorkout } = require('../scheduled-workout');
    return {
      scheduledWorkouts: {
        relation: BaseModel.HasManyRelation,
        modelClass: ScheduledWorkout,
        join: {
          from: 'training_programme.id',
          to: 'training_programme_workout.training_programme_id',
        },
      },
      onDemandWorkouts: {
        relation: BaseModel.HasManyRelation,
        modelClass: OnDemandWorkout,
        join: {
          from: 'training_programme.id',
          to: 'on_demand_workout.training_programme_id',
        },
      },
      trainer: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Trainer,
        join: {
          from: 'training_programme.trainer_id',
          to: 'trainer.id',
        },
      },
      challenges: {
        relation: BaseModel.HasManyRelation,
        modelClass: Challenge,
        join: {
          from: 'training_programme.id',
          to: 'challenge.training_programme_id',
        },
      },
      localisations: {
        relation: BaseModel.HasManyRelation,
        modelClass: ProgrammeTranslation,
        join: {
          from: 'training_programme.id',
          to: 'training_programme_tr.training_programme_id',
        },
      },
      shareMediaImages: {
        relation: BaseModel.HasManyRelation,
        modelClass: ShareMedia,
        join: {
          from: 'training_programme.id',
          to: 'share_media_image.training_programme_id',
        },
      },
      images: {
        relation: BaseModel.HasManyRelation,
        modelClass: ProgrammeImage,
        join: {
          from: 'training_programme.id',
          to: 'training_programme_image.training_programme_id',
        },
      },
    };
  }
}
