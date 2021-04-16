/* eslint-disable @typescript-eslint/no-var-requires */
import { BaseModel } from '@lib/database';
import type { Taxonomy } from './taxonomy.model';
import type { TaxonomyTermTranslation } from './taxonomy-term-translation.model';

export class TaxonomyTerm extends BaseModel {
  static tableName = 'taxonomy_term';

  id: string;
  key: string;
  taxonomyId: string;

  taxonomy: Taxonomy;
  localisations: TaxonomyTermTranslation[];

  static get relationMappings() {
    const { Taxonomy } = require('./taxonomy.model');
    const {
      TaxonomyTermTranslation,
    } = require('./taxonomy-term-translation.model');

    return {
      taxonomy: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Taxonomy,
        join: {
          from: 'taxonomy_term.taxonomy_id',
          to: 'taxonomy.id',
        },
      },
      localisations: {
        relation: BaseModel.HasManyRelation,
        modelClass: TaxonomyTermTranslation,
        join: {
          from: 'taxonomy_term.id',
          to: 'taxonomy_term_tr.taxonomy_term_id',
        },
      },
    };
  }
}
