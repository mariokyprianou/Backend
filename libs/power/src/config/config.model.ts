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

  translations: Translation[];

  public getTranslation(language: string) {
    return (this.translations ?? []).find((tr) => tr.language === language);
  }

  static relationMappings = {
    translations: {
      relation: BaseModel.HasManyRelation,
      modelClass: Translation,
      join: {
        from: 'config.id',
        to: 'config_tr.config_id',
      },
    },
  };
}
