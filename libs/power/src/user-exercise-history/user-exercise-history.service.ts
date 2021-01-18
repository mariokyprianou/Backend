import { Injectable } from '@nestjs/common';
import { Account } from '../account';
import { ExerciseWeight } from '../types';
import { UserExerciseHistory } from './user-exercise-history.model';

@Injectable()
export class UserExerciseHistoryService {
  public async addHistory(input: ExerciseWeight, sub: string) {
    const account = await Account.query()
      .first()
      .where('cognito_username', sub);
    return UserExerciseHistory.query().insertAndFetch({
      ...input,
      accountId: account.id,
    });
  }
}
