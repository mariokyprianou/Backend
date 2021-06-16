import { Injectable } from '@nestjs/common';
import { Exercise } from '../exercise';
import { UserExerciseHistory } from './user-exercise-history.model';

@Injectable()
export class UserExerciseHistoryService {
  public async findByExercise(params: {
    accountId: string;
    exerciseId: string;
  }) {
    // Include exercises that share the same category
    const exercisesWithSameCategory = Exercise.query()
      .select('category_exercises.id')
      .where('exercise.id', params.exerciseId)
      .join(
        'exercise as category_exercises',
        'exercise.category_id',
        'category_exercises.category_id',
      );

    return UserExerciseHistory.query()
      .where('account_id', params.accountId)
      .where((qb) =>
        qb
          .where('exercise_id', params.exerciseId)
          .orWhereIn('exercise_id', exercisesWithSameCategory),
      )
      .orderBy('created_at', 'DESC')
      .orderBy('exercise_id')
      .orderBy('set_number', 'DESC');
  }
}
