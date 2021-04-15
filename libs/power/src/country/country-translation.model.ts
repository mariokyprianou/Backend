/* eslint-disable @typescript-eslint/no-var-requires */
import { UserModel } from '@lib/database';
import { Model } from 'objection';
import type { Country } from './country.model';

export class CountryTranslation extends UserModel {
  static tableName = 'country_tr';

  id: string;
  countryId: string;
  language: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  localisations: CountryTranslation;
  country: Country;

  static get relationMappings() {
    const { Country } = require('./country.model');
    return {
      country: {
        relation: Model.BelongsToOneRelation,
        modelClass: Country,
        join: {
          from: 'country_tr.country_id',
          to: 'country.id',
        },
      },
    };
  }
}
