import { Injectable } from '@nestjs/common';
import { UserExerciseHistory } from './user-exercise-history.model';

@Injectable()
export class UserExerciseHistoryService {
  public async findByExercise(params: {
    accountId: string;
    exerciseId: string;
  }) {
    return UserExerciseHistory.query()
      .where('exercise_id', params.exerciseId)
      .andWhere('account_id', params.accountId)
      .orderBy('created_at', 'DESC')
      .orderBy('set_number', 'DESC');
  }
}
