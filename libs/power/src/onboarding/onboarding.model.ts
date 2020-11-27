import { BaseModel } from '@lib/database';
// import {  } from 'objection';
import { OnboardingTranslation as Translation } from './onboarding-tr.model';

export class Onboarding extends BaseModel {
  static tableName = 'onboarding_screen';

//   static get columnNameMappers() {
//     return BaseModel();
//   }

  id: string;
  orderIndex: number;
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
        from: 'onboarding_screen.id',
        to: 'onboarding_screen_tr.onboarding_screen_id',
      },
    },
  };
}
