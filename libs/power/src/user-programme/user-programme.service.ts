import { Injectable } from '@nestjs/common';
import Objection from 'objection';
import { Account, AccountService } from '../account';
import { UserWorkoutWeek } from '../user-workout-week';
import { UserProgramme } from './user-programme.model';

@Injectable()
export class UserProgrammeService {
  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'created_at',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: UserProgramFilter = {},
  ) {
    const findAllQuery = applyFilter(
      UserProgramme.query().withGraphFetched('trainingProgramme.localisations'),
      filter,
    );

    findAllQuery.limit(perPage).offset(perPage * page);
    findAllQuery.orderBy(sortField, sortOrder);

    return findAllQuery;
  }

  public findAllMeta(filter: UserProgramFilter = {}) {
    return applyFilter(
      UserProgramme.query().withGraphFetched('trainingProgramme.localisations'),
      filter,
    ).resultSize();
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }

  public async allUserProgrammes(account: string) {
    return UserProgramme.query()
      .withGraphFetched('trainingProgramme')
      .where('account_id', account);
  }

  public async fetchCurrentUserWeek(account: Account) {
    const weeks = await UserWorkoutWeek.query()
      .whereNull('user_workout_week.completed_at')
      .andWhere(
        'user_workout_week.user_training_programme_id',
        account.userTrainingProgrammeId,
      );

    return this.returnCurrentWeekNumber(weeks);
  }

  private returnCurrentWeekNumber(weeks) {
    return weeks.reduce((a, b) => {
      if (a === 0) {
        return b.weekNumber;
      }
      if (a === b.weekNumber) {
        return a;
      }
      if (a > b.weekNumber) {
        return b.weekNumber;
      }
      return a;
    }, 0);
  }
}

const applyFilter = (
  query: Objection.QueryBuilder<UserProgramme, UserProgramme[]>,
  filter: UserProgramFilter,
): Objection.QueryBuilder<UserProgramme, UserProgramme[]> => {
  if (filter.id) {
    query.findByIds([filter.id]);
  }

  if (filter.ids) {
    query.findByIds(filter.ids);
  }

  return query;
};

export interface UserProgramFilter {
  id?: string;
  ids?: string[];
}
