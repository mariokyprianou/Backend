import { BaseModel } from '@lib/database';

export class TaxonomyTranslation extends BaseModel {
  static tableName = 'taxonomy_tr';

  id: string;
  taxonomyId: string;
  language: string;
  name: string;
}
