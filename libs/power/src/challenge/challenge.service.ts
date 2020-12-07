import { Injectable } from '@nestjs/common';
import {
  CreateChallengeGraphQlInput,
  UpdateChallengeGraphQlInput,
} from 'apps/cms/src/challenge/challenge.cms.resolver';
import Objection from 'objection';
import { ChallengeHistory } from './challenge-history.model';
import { ChallengeTranslation } from './challenge-translation.model';
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
      Challenge.query().withGraphFetched('localisations'),
      filter,
    );

    findAllQuery.limit(perPage).offset(perPage * page);
    findAllQuery.orderBy(sortField, sortOrder);

    return findAllQuery;
  }

  public findAllMeta(filter: ChallengeFilter = {}) {
    return applyFilter(Challenge.query(), filter).resultSize();
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

    console.error('TODO: actually delete the challenge!');
    // TODO: I think we need a deleted flag in the database
    // await ChallengeTranslation.query().where('challenge_id', id).delete();
    // // await ChallengeHistory.query().where('challenge_id', id).delete();
    // await Challenge.query().deleteById(id);

    return challenge;
  }
}

export interface ChallengeFilter {
  id?: string;
  ids?: string[];
  type?: ChallengeType;
}

const applyFilter = (
  hmcQuestionQuery: Objection.QueryBuilder<Challenge, Challenge[]>,
  filter: ChallengeFilter,
): Objection.QueryBuilder<Challenge, Challenge[]> => {
  if (filter.id) {
    hmcQuestionQuery.findByIds([filter.id]);
  }

  if (filter.ids) {
    hmcQuestionQuery.findByIds(filter.ids);
  }

  if (filter.type) {
    hmcQuestionQuery.where('type', filter.type);
  }

  return hmcQuestionQuery;
};
