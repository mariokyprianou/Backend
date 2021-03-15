import { BaseModel } from '@lib/database';
import { ConfigTranslation as Translation } from './config-tr.model';

export enum ConfigType {
  TERMS = 'TERMS',
  PRIVACY = 'PRIVACY',
  THREE_DAYS_WITHOUT_TRAINING = 'THREE_DAYS_WITHOUT_TRAINING',
  TWO_WEEKS_WITHOUT_OPENING_APP = 'TWO_WEEKS_WITHOUT_OPENING_APP',
  SEVEN_DAYS_WITHOUT_LOGGING_CHALLENGE = 'SEVEN_DAYS_WITHOUT_LOGGING_CHALLENGE',
  NEW_TRAINER_ADDED = 'NEW_TRAINER_ADDED',
  NEW_CHALLENGE_ADDED = 'NEW_CHALLENGE_ADDED',
  END_OF_COMPLETED_WORKOUT_WEEK = 'END_OF_COMPLETED_WORKOUT_WEEK',
}

export class Config extends BaseModel {
  static tableName = 'config';

  id: string;
  type: ConfigType;
  createdAt: Date;
  updatedAt: Date;

  // Why two?
  // The person who did this first didn't follow the convention of the rest of the
  // app and whilst fixing another problem I didn't want to break anything after I realised
  // this situation
  translations: Translation[];
  localisations: Translation[];

  public getTranslation(language: string) {
    return (this.translations ?? []).find((tr) => tr.language === language);
  }

  static relationMappings = () => ({
    translations: {
      relation: BaseModel.HasManyRelation,
      modelClass: Translation,
      join: {
        from: 'config.id',
        to: 'config_tr.config_id',
      },
    },
    localisations: {
      relation: BaseModel.HasManyRelation,
      modelClass: Translation,
      join: {
        from: 'config.id',
        to: 'config_tr.config_id',
      },
    },
  });
}
