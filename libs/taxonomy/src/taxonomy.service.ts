import { Injectable } from '@nestjs/common';
import { raw, ref } from 'objection';
import { Taxonomy } from './models';
import { ITaxonomyTerm } from './taxonomy.interface';
import { isUuid } from './util';

@Injectable()
export class TaxonomyService {
  async findTerms(
    taxonomyIdOrKey,
    opts: { language: string } = { language: 'en' },
  ): Promise<ITaxonomyTerm[]> {
    const idField = isUuid(taxonomyIdOrKey) ? 'taxonomy.id' : 'taxonomy.key';
    return Taxonomy.query()
      .select(
        'taxonomy.id as id',
        raw('COALESCE(tr.name, tr_fallback.name, terms.key) as name'),
      )
      .joinRelated('terms')
      .joinRaw(
        `left join taxonomy_term_tr as tr on (terms.id = tr.taxonomy_term_id and tr.language = ?)`,
        [opts.language],
      )
      .joinRaw(
        `left join taxonomy_term_tr as tr_fallback on (terms.id = tr_fallback.taxonomy_term_id and tr_fallback.language = ?)`,
        ['en'],
      )
      .orderBy(raw('COALESCE(tr.name, tr_fallback.name, terms.key)'), 'ASC')
      .where(ref(idField), taxonomyIdOrKey)
      .debug()
      .toKnexQuery<ITaxonomyTerm>();
  }
}
