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

  constructor(@Inject(CONTEXT) context: { authContext: { id: string } }) {
    this.accountId = context?.authContext?.id;
  }

  public readonly findByTrainerId = new DataLoader<string, Programme[]>(
    async (trainerIds) => {
      const programmes = await Programme.query()
        .whereIn('trainer_id', trainerIds as string[])
        .andWhere('status', PublishStatus.PUBLISHED)
        .withGraphFetched('localisations');

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
      if (result) {
        return result;
      } else {
        return {
          id,
          isActive: false,
          latestWeek: 0,
        };
      }
    });
  });

  public findActiveProgrammeByAccountId = new DataLoader<string, Programme>(
    async (accountIds) => {
      const userProgrammes = await Account.relatedQuery<UserProgramme>(
        'trainingProgramme',
      )
        .withGraphJoined('trainingProgramme')
        .for(accountIds as string[]);

      await Programme.fetchGraph(
        userProgrammes.map((p) => p.trainingProgramme),
        'localisations',
      ).modifyGraph('localisations', (qb) => qb.where(ref('language'), 'en'));

      return accountIds.map((accountId) => {
        const userProgramme = userProgrammes.find(
          (programme) => programme.accountId === accountId,
        );
        return userProgramme?.trainingProgramme;
      });
    },
  );
}
