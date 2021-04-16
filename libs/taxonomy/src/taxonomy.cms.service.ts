import { Injectable } from '@nestjs/common';
import { ICmsParams } from '@lib/common';
import { applyPagination } from '@lib/database';
import { CreateTaxonomyTermDto, UpdateTaxonomyTermDto } from './dto';
import { Taxonomy, TaxonomyTerm, TaxonomyTermTranslation } from './models';
import * as _ from 'lodash';
import { isUuid } from './util';

function generateTermKey(params: CreateTaxonomyTermDto) {
  if (params.key) return params.key;
  const localisation = params.localisations.find((l) => l.language === 'en');
  if (!localisation) {
    throw new Error('Taxonomy term requires a key');
  }
  return _.kebabCase(localisation.name);
}

@Injectable()
export class TaxonomyCmsService {
  private baseQuery(params: ICmsParams = {}) {
    const query = TaxonomyTerm.query().withGraphFetched('localisations');
    if (params.filter) {
      if (params.filter.id) {
        query.findById(params.filter.id);
      }
      if (params.filter.ids) {
        query.findByIds(params.filter.ids);
      }
    }

    applyPagination(query, params);

    return query;
  }

  public async findTermById(id: string): Promise<TaxonomyTerm> {
    return this.baseQuery().findById(id);
  }

  public async findAllTerms(params: ICmsParams): Promise<TaxonomyTerm[]> {
    return this.baseQuery(params);
  }

  public async findTermCount(params: ICmsParams): Promise<{ count: number }> {
    const count = await this.baseQuery(params).resultSize();
    return { count };
  }

  public async createTerm(
    taxonomyIdOrKey: string,
    params: CreateTaxonomyTermDto,
  ) {
    const field = isUuid(taxonomyIdOrKey) ? 'id' : 'key';
    const taxonomy = await Taxonomy.query()
      .findOne({ [field]: taxonomyIdOrKey })
      .throwIfNotFound({ id: taxonomyIdOrKey });

    const term = await Taxonomy.transaction(async (trx) => {
      return taxonomy.$relatedQuery('terms', trx).insertGraph({
        key: generateTermKey(params),
        localisations: params.localisations.map<
          Partial<TaxonomyTermTranslation>
        >((localisation) => ({
          language: localisation.language,
          name: localisation.name,
        })),
      });
    });

    return this.findTermById(term.id);
  }

  public async updateTerm(params: UpdateTaxonomyTermDto) {
    const term = await TaxonomyTerm.query()
      .findById(params.id)
      .withGraphFetched('localisations')
      .throwIfNotFound();

    await TaxonomyTerm.transaction(async (trx) => {
      if (params.key && term.key !== params.key) {
        await term.$query(trx).patch({ key: params.key });
      }

      for (const existing of term.localisations) {
        const updated = params.localisations.find(
          (loc) => loc.language === existing.language,
        );

        if (!updated) {
          await existing.$query(trx).delete();
        } else if (existing.name !== updated.name) {
          await existing.$query(trx).patch({ name: updated.name });
        }
      }
    });

    return this.findTermById(params.id);
  }

  public async deleteTermById(id: string): Promise<TaxonomyTerm> {
    const term = await this.baseQuery().findById(id).throwIfNotFound({ id });
    await term.$query().delete();
    return term;
  }
}
