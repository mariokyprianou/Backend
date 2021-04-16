import { BaseModel } from '@lib/database';

export class TaxonomyTermTranslation extends BaseModel {
  static tableName = 'taxonomy_term_tr';

  id: string;
  taxonomyTermId: string;
  language: string;
  name: string;
}
