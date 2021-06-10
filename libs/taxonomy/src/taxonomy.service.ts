import { Injectable } from '@nestjs/common';
import { raw, ref } from 'objection';
import { Taxonomy } from './models';
import { ITaxonomyTerm } from './taxonomy.interface';
import { isUuid } from './util';
import * as _ from 'lodash';

@Injectable()
export class TaxonomyService {
  async findTerms(
    taxonomyIdOrKey: string,
    opts: { language: string } = { language: 'en' },
  ): Promise<ITaxonomyTerm[]> {
    const idField = isUuid(taxonomyIdOrKey) ? 'taxonomy.id' : 'taxonomy.key';
    return Taxonomy.query()
      .select(
        'terms.id as id',
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
      .toKnexQuery<ITaxonomyTerm>();
  }

  async findTermsByModelIds(
    ids: string[],
    {
      joinTable,
      language,
    }: {
      joinTable: {
        tableName: string;
        modelIdColumn: string;
        termIdColumn?: string;
      };
      language: string;
    },
  ) {
    const results = await Taxonomy.query()
      .select(
        'terms.id as id',
        `${joinTable.tableName}.${joinTable.modelIdColumn} as modelId`,
        raw('COALESCE(tr.name, tr_fallback.name, terms.key) as name'),
      )
      .joinRelated('terms')
      .join(
        joinTable.tableName,
        'terms.id',
        `${joinTable.tableName}.${
          joinTable.termIdColumn ?? 'taxonomy_term_id'
        }`,
      )
      .joinRaw(
        `left join taxonomy_term_tr as tr on (terms.id = tr.taxonomy_term_id and tr.language = ?)`,
        [language],
      )
      .joinRaw(
        `left join taxonomy_term_tr as tr_fallback on (terms.id = tr_fallback.taxonomy_term_id and tr_fallback.language = ?)`,
        ['en'],
      )
      .whereIn(`${joinTable.tableName}.${joinTable.modelIdColumn}`, ids)
      .orderBy(raw('COALESCE(tr.name, tr_fallback.name, terms.key)'), 'ASC')
      .toKnexQuery<ITaxonomyTerm & { modelId: string }>()
      .debug(true);

    return _.groupBy(results, (row) => row.modelId);
  }
}
