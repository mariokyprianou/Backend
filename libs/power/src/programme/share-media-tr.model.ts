/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';

export class ShareMediaTranslation extends BaseModel {
  static tableName = 'share_media_image_tr';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  shareMediaImageId: string;
  language: string;
  imageKey: string;
  colour: string;
}
