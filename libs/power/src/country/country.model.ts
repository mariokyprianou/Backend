/* eslint-disable @typescript-eslint/no-var-requires */
import { UserModel } from '@lib/database';
import { Model } from 'objection';
import type { Region } from '../region';
import type { CountryTranslation } from './country-translation.model';
export class Country extends UserModel {
  static tableName = 'country';
  id: string;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;

  regions: Region[];
  localisations: CountryTranslation[];

  static get relationMappings() {
    const { Region } = require('../region/region.model');
    const { CountryTranslation } = require('./country-translation.model');
    return {
      localisations: {
        relation: Model.HasManyRelation,
        modelClass: CountryTranslation,
        join: {
          from: 'country.id',
          to: 'country_tr.country_id',
        },
      },
      regions: {
        relation: Model.HasManyRelation,
        modelClass: Region,
        join: {
          from: 'country.id',
          to: 'region.country_id',
        },
      },
    };
  }
}
