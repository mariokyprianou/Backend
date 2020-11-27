import { BaseModel } from '@lib/database';
// import {  } from 'objection';
import { ConfigTranslation as Translation } from './config-tr.model';

export class Config extends BaseModel {
  static tableName = 'config';

//   static get columnNameMappers() {
//     return BaseModel();
//   }

  id: string;
  key: string;

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
