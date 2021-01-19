import { Injectable } from '@nestjs/common';
import { Account } from '../account';
import { ExerciseNote } from '../types';
import { UserExerciseNote } from './user-exercise-note.model';

@Injectable()
export class UserExerciseNoteService {
  public async addExerciseNote(input: ExerciseNote, sub: string) {
    const account = await Account.query().findOne('cognito_username', sub);

    // Check if they have an existing exercise not?
    const existingNote = await UserExerciseNote.query()
      .findOne('accountId', account.id)
      .where('exercise_id', input.exercise);

    if (!existingNote) {
      return UserExerciseNote.query().insertAndFetch({
        accountId: account.id,
        exerciseId: input.exercise,
        note: input.note,
      });
    }
    return UserExerciseNote.query()
      .patch({ note: input.note })
      .where('exercise_id', input.exercise)
      .andWhere('account_id', account.id);
  }
}
