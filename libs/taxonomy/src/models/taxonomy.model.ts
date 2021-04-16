/* eslint-disable @typescript-eslint/no-var-requires */
import { BaseModel } from '@lib/database';
import type { TaxonomyTerm } from './taxonomy-term.model';
import type { TaxonomyTranslation } from './taxonomy-translation.model';

export class Taxonomy extends BaseModel {
  static tableName = 'taxonomy';

  id: string;
  key: string;

  terms: TaxonomyTerm[];

  localisations: TaxonomyTranslation[];

  static get relationMappings() {
    const { TaxonomyTerm } = require('./taxonomy-term.model');
    const { TaxonomyTranslation } = require('./taxonomy-translation.model');
    return {
      terms: {
        relation: BaseModel.HasManyRelation,
        modelClass: TaxonomyTerm,
        join: {
          from: 'taxonomy.id',
          to: 'taxonomy_term.taxonomy_id',
        },
      },
      localisations: {
        relation: BaseModel.HasManyRelation,
        modelClass: TaxonomyTranslation,
        join: {
          from: 'taxonomy.id',
          to: 'taxonomy_tr.taxonomy_id',
        },
      },
    };
  }
}
