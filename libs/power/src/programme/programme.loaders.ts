import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import * as DataLoader from 'dataloader';
import { ref } from 'objection';
import { Account } from '../account';
import { PublishStatus } from '../types';
import { UserProgramme } from '../user-programme';
import { ProgrammeImage } from './programme-image.model';
import { Programme } from './programme.model';
import { ShareMedia } from './share-media.model';

type ProgrammeProgress = {
  id: string;
  latestWeek: number;
  isActive: boolean;
};

@Injectable({ scope: Scope.REQUEST })
export class ProgrammeLoaders {
  private readonly accountId: string;
  private readonly language: string;

  constructor(
    @Inject(CONTEXT) context: { authContext: { id: string }; language: string },
  ) {
    this.accountId = context?.authContext?.id;
    this.language = context.language ?? 'en';
  }

  private baseQuery() {
    return Programme.query()
      .withGraphJoined('localisations')
      .modifyGraph('localisations', (qb) =>
        qb.where(ref('language'), this.language),
      );
  }

  public readonly findById = new DataLoader<string, Programme>(async (ids) => {
    const programmes = await this.baseQuery().findByIds(ids as string[]);
    return ids.map((id) => programmes.find((programme) => programme.id === id));
  });

  public readonly findActiveByTrainerId = new DataLoader<string, Programme[]>(
    async (trainerIds) => {
      const programmes = await this.baseQuery()
        .whereIn('trainer_id', trainerIds as string[])
        .andWhere('status', PublishStatus.PUBLISHED)
        .whereNull('deleted_at');

      return trainerIds.map((trainerId) =>
        programmes.filter((programme) => programme.trainerId === trainerId),
      );
    },
  );

  public findImagesByProgrammeId = new DataLoader<string, ProgrammeImage[]>(
    async (programmeIds) => {
      const images = await ProgrammeImage.query().whereIn(
        'training_programme_id',
        programmeIds as string[],
      );

      return programmeIds.map((programmeId) =>
        images.filter((image) => image.trainingProgrammeId === programmeId),
      );
    },
  );

  public findShareMediaByProgrammeId = new DataLoader<string, ShareMedia[]>(
    async (programmeIds) => {
      const images = await ShareMedia.query()
        .whereIn('training_programme_id', programmeIds as string[])
        .withGraphFetched('localisations');

      return programmeIds.map((programmeId) =>
        images.filter((image) => image.trainingProgrammeId === programmeId),
      );
    },
  );

  public findUserProgressByProgrammeId = new DataLoader<
    string,
    ProgrammeProgress
  >(async (programmeIds) => {
    const db = Account.knex();
    const results: ProgrammeProgress[] = await db
      .with(
        'progress',
        db
          .select(
            'utp.training_programme_id as id',
            db.raw('MAX(uww.week_number) as "latestWeek"'),
          )
          .from('user_training_programme as utp')
          .join(
            'user_workout_week as uww',
            'utp.id',
            'uww.user_training_programme_id',
          )
          .where('utp.account_id', this.accountId)
          .groupBy('utp.account_id', 'utp.training_programme_id'),
      )
      .select(
        db.raw('u.training_programme_id = progress.id as "isActive"'),
        'progress.*',
      )
      .from('account as a')
      .join(
        'user_training_programme as u',
        'a.user_training_programme_id',
        'u.id',
      )
      .crossJoin(db.raw('progress'))
      .where('a.id', this.accountId);

    return programmeIds.map((id) => {
      const result = results.find((result) => result.id === id);
      return result ?? null;
    });
  });

  public findProgrammeInfoByAccountId = new DataLoader<string, Programme>(
    async (accountIds) => {
      const userProgrammes = await Account.relatedQuery<UserProgramme>(
        'trainingProgramme',
      )
        .withGraphJoined('trainingProgramme')
        .for(accountIds as string[]);

      await Programme.fetchGraph(
        userProgrammes.map((p) => p.trainingProgramme),
        'localisations',
      ).modifyGraph('localisations', (qb) =>
        qb.where(ref('language'), this.language),
      );

      return accountIds.map((accountId) => {
        const userProgramme = userProgrammes.find(
          (programme) => programme.accountId === accountId,
        );
        return userProgramme?.trainingProgramme;
      });
    },
  );

  public findSubscriberCount = new DataLoader<string, number>(
    async (trainingProgrammeIds) => {
      const results = await Programme.knex()
        .select('training_programme_id', 'count')
        .from('subscriber_stats')
        .whereIn('training_programme_id', trainingProgrammeIds);
      return trainingProgrammeIds
        .map((id) => results.find((row) => row.training_programme_id === id))
        .map((row) => row?.count ?? 0);
    },
  );
}
