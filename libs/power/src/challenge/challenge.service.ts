import { Injectable } from '@nestjs/common';
import Objection from 'objection';
import { Account } from '../account';
import { ChallengeHistory } from './challenge-history.model';
import { ChallengeType, IChallenge } from './challenge.interface';
import { Challenge } from './challenge.model';
import { CreateChallengeDto, UpdateChallengeDto } from './dto';

@Injectable()
export class ChallengeService {
  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'created_at',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: ChallengeFilter = {},
  ) {
    const query = Challenge.query()
      .whereNull('deleted_at')
      .withGraphFetched('localisations');
    applyFilter(query, filter);

    query.limit(perPage).offset(perPage * page);
    query.orderBy(sortField, sortOrder);

    return query;
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

  public async create(challenge: CreateChallengeDto) {
    const challengeModel = await Challenge.query().insertGraphAndFetch(
      challenge,
      { relate: true },
    );

    return this.findById(challengeModel.id);
  }

  public async update(challenge: UpdateChallengeDto) {
    const challengeModel = await Challenge.query()
      .upsertGraphAndFetch(challenge, { relate: true })
      .first();

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

  public async submitChallenge(params: {
    accountId: string;
    challengeId: string;
    quantity: string;
  }) {
    // Ensure challenge exists
    await Challenge.query()
      .select(1)
      .findById(params.challengeId)
      .throwIfNotFound();
    try {
      await ChallengeHistory.query().insert({
        accountId: params.accountId,
        challengeId: params.challengeId,
        quantity: params.quantity,
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async findUserHistory(params: {
    accountId: string;
    language: string;
  }) {
    const histories = await ChallengeHistory.query().where(
      'account_id',
      params.accountId,
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

    const formattedChallenges = challenges.map((challenge) =>
      toChallengeDto(challenge, params.language),
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

  public async findUserChallenges(params: {
    accountId: string;
    language: string;
  }): Promise<IChallenge[]> {
    const userProgramme = await Account.relatedQuery('trainingProgramme')
      .for(params.accountId)
      .first();

    const challenges = await Challenge.query()
      .whereNull('deleted_at')
      .andWhere('training_programme_id', userProgramme.trainingProgrammeId)
      .withGraphFetched('localisations');

    return challenges.map((challenge) =>
      toChallengeDto(challenge, params.language),
    );
  }
}

export interface ChallengeFilter {
  id?: string;
  ids?: string[];
  type?: ChallengeType;
  programmeId?: string;
}

const toChallengeDto = (challenge: Challenge, language: string): IChallenge => {
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
    imageKey: challenge.imageKey,
  };
};

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
