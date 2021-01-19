import { Module } from '@nestjs/common';
import { UserExerciseNoteService } from './user-exercise-note.service';

@Module({
  providers: [UserExerciseNoteService],
  exports: [UserExerciseNoteService],
})
export class UserExerciseNoteModule {}
