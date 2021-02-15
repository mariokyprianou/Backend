import { Injectable } from '@nestjs/common';
import {
  ChallengeInput,
  ChallengeInt,
  ChallengeType,
} from 'apps/app/src/challenge/challenge.resolver';
import {
  CreateChallengeGraphQlInput,
  UpdateChallengeGraphQlInput,
} from 'apps/cms/src/challenge/challenge.cms.resolver';
import { GraphQLError } from 'graphql';
import Objection from 'objection';
import { Account, AccountService } from '../account';
import { AuthContext } from '../types';
import { UserProgramme } from '../user-programme';
import { ChallengeHistory } from './challenge-history.model';
import { Challenge } from './challenge.model';

@Injectable()
export class ChallengeService {
  constructor(private accountService: AccountService) {}

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

  public async submitChallenge(
    input: ChallengeInput,
    authContext: AuthContext,
  ) {
    const challenge = await Challenge.query()
      .first()
      .where('id', input.challengeId);
    if (!challenge) {
      throw new GraphQLError('Unknown challengeId');
    }
    try {
      const account = await this.accountService.findBySub(authContext.sub);
      // input the result
      await ChallengeHistory.query().insert({
        challengeId: input.challengeId,
        quantity: input.result,
        accountId: account.id,
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async findUserHistory(language = 'en', authContext: AuthContext) {
    const account = await this.accountService.findBySub(authContext.sub);
    const histories = await ChallengeHistory.query().where(
      'account_id',
      account.id,
    );
    const challengeList = [];
    histories.forEach((val) => {
      if (challengeList.includes(val.challengeId)) {
        return;
      }
      challengeList.push(val.challengeId);
    });
    const challenges = await Challenge.query()
      .whereIn('id', challengeList)
      .withGraphFetched('localisations');

    const formattedChallenges = challenges.map(
      (challenge): ChallengeInt => {
        const locale = challenge.getTranslation(language);
        return {
          id: challenge.id,
          type: challenge.type,
          name: locale.name,
          fieldDescription: locale.fieldDescription,
          fieldTitle: locale.fieldTitle,
          createdAt: challenge.createdAt,
          duration: challenge.duration,
          unitType: challenge.unitType,
        };
      },
    );

    return challengeList.map((id) => {
      const results = histories.filter((val) => val.challengeId === id);
      const challenge = formattedChallenges.find((val) => val.id === id);
      return {
        challenge,
        history: results.map((val) => ({
          id: val.id,
          createdAt: val.createdAt,
          value: val.quantity,
        })),
      };
    });
  }

  public async findUserChallenges(
    language = 'en',
    authContext: AuthContext,
  ): Promise<ChallengeInt[]> {
    // fetch the account
    // fetch the user programme
    // fetch the challenges for that programme
    const account = await this.accountService.findBySub(authContext.sub);
    const userProgramme = await UserProgramme.query()
      .first()
      .where('id', account.userTrainingProgrammeId);
    const challenges = await Challenge.query()
      .whereNull('deleted_at')
      .andWhere('training_programme_id', userProgramme.trainingProgrammeId)
      .withGraphFetched('localisations');

    return challenges.map(
      (challenge): ChallengeInt => {
        const locale = challenge.getTranslation(language);
        return {
          id: challenge.id,
          type: challenge.type,
          name: locale.name,
          fieldDescription: locale.fieldDescription,
          fieldTitle: locale.fieldTitle,
          createdAt: challenge.createdAt,
          duration: challenge.duration,
          unitType: challenge.unitType,
        };
      },
    );
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
