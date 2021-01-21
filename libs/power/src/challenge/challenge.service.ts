import { Injectable } from '@nestjs/common';
import {
  CreateChallengeGraphQlInput,
  UpdateChallengeGraphQlInput,
} from 'apps/cms/src/challenge/challenge.cms.resolver';
import Objection from 'objection';
import { Challenge, ChallengeType } from './challenge.model';

@Injectable()
export class ChallengeService {
  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'created_at',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: ChallengeFilter = {},
  ) {
    const findAllQuery = applyFilter(
      Challenge.query()
        .whereNull('deleted_at')
        .withGraphFetched('localisations'),
      filter,
    );

    findAllQuery.limit(perPage).offset(perPage * page);
    findAllQuery.orderBy(sortField, sortOrder);

    return findAllQuery;
  }

  public findAllMeta(filter: ChallengeFilter = {}) {
    return applyFilter(
      Challenge.query().whereNull('deleted_at'),
      filter,
    ).resultSize();
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }

  public async create(challenge: CreateChallengeGraphQlInput) {
    const challengeModel = await Challenge.query().insertGraphAndFetch(
      challenge,
      {
        relate: true,
      },
    );

    return this.findById(challengeModel.id);
  }

  public async update(challenge: UpdateChallengeGraphQlInput) {
    const challengeModel = await Challenge.query().upsertGraphAndFetch(
      challenge,
      {
        relate: true,
      },
    );

    return this.findById(challengeModel.id);
  }

  public async delete(id: string) {
    const challenge = await this.findById(id);

    await Challenge.query()
      .patch({
        deletedAt: new Date(),
      })
      .findById(id);

    return challenge;
  }
}

export interface ChallengeFilter {
  id?: string;
  ids?: string[];
  type?: ChallengeType;
  programmeId?: string;
}

const applyFilter = (
  query: Objection.QueryBuilder<Challenge, Challenge[]>,
  filter: ChallengeFilter,
): Objection.QueryBuilder<Challenge, Challenge[]> => {
  if (filter.id) {
    query.findByIds([filter.id]);
  }

  if (filter.ids) {
    query.findByIds(filter.ids);
  }

  if (filter.type) {
    query.where('type', filter.type);
  }

  if (filter.programmeId) {
    query.where('challenge.training_programme_id', filter.programmeId);
  }

  return query;
};
