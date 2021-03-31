import { Injectable } from '@nestjs/common';
import { Account } from '../account';
import { ExerciseWeight } from '../types';
import { UserExerciseHistory } from './user-exercise-history.model';

@Injectable()
export class UserExerciseHistoryService {
  private async findAccountIdBySub(sub: string) {
    const account = await Account.query()
      .findOne('cognito_username', sub)
      .select('id')
      .throwIfNotFound();

    return account?.id;
  }

  public async addHistory(input: ExerciseWeight, cognitoSub: string) {
    const accountId = await this.findAccountIdBySub(cognitoSub);
    return UserExerciseHistory.query().insertAndFetch({
      ...input,
      accountId,
    });
  }

  public async findByExercise(exerciseId: string, cognitoSub: string) {
    const accountId = await this.findAccountIdBySub(cognitoSub);
    return UserExerciseHistory.query()
      .where('exercise_id', exerciseId)
      .andWhere('account_id', accountId)
      .orderBy('created_at', 'DESC')
      .orderBy('set_number', 'DESC');
  }
}
