/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { ShareMediaTranslation } from './share-media-tr.model';
import { ShareMediaImageType } from './share-media.interface';

export class ShareMedia extends BaseModel {
  static tableName = 'share_media_image';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  trainingProgrammeId: string;
  type: ShareMediaImageType;

  localisations: ShareMediaTranslation[];

  public getTranslation(language: string) {
    return (this.localisations ?? []).find((tr) => tr.language === language);
  }

  static relationMappings = {
    localisations: {
      relation: Model.HasManyRelation,
      modelClass: ShareMediaTranslation,
      join: {
        from: 'share_media_image.id',
        to: 'share_media_image_tr.share_media_image_id',
      },
    },
  };
}
