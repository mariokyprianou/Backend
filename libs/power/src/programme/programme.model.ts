/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { ProgrammeTranslation } from './programme-tr.model';
import { ProgrammeImage } from './programme-image.model';
import { ProgrammeEnvironment, PublishStatus } from '../types';
import { Trainer } from '../trainer';
import { ShareMedia } from './share-media.model';

export class Programme extends BaseModel {
  static tableName = 'training_programme';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  trainerId: string;
  environment: ProgrammeEnvironment;
  fitness: number;
  muscle: number;
  fatLoss: number;
  status: PublishStatus;
  createdAt: Date;
  updatedAt: Date;

  localisations: ProgrammeTranslation[];
  images: ProgrammeImage[];
  shareMediaImages: ShareMedia[];
  trainer: Trainer;

  public getTranslation(language: string) {
    return (this.localisations ?? []).find((tr) => tr.language === language);
  }

  static relationMappings = {
    localisations: {
      relation: Model.HasManyRelation,
      modelClass: ProgrammeTranslation,
      join: {
        from: 'training_programme.id',
        to: 'training_programme_tr.training_programme_id',
      },
    },
    shareMediaImages: {
      relation: Model.HasManyRelation,
      modelClass: ShareMedia,
      join: {
        from: 'training_programme.id',
        to: 'share_media_image.training_programme_id',
      },
    },
    images: {
      relation: Model.HasManyRelation,
      modelClass: ProgrammeImage,
      join: {
        from: 'training_programme.id',
        to: 'training_programme_image.training_programme_id',
      },
    },
    trainer: {
      relation: Model.BelongsToOneRelation,
      modelClass: Trainer,
      join: {
        from: 'training_programme.trainer_id',
        to: 'trainer.id',
      },
    },
  };
}
