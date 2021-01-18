import { Module } from '@nestjs/common';
import { UserExerciseHistoryService } from './user-exercise-history.service';

@Module({
  imports: [],
  providers: [UserExerciseHistoryService],
  exports: [UserExerciseHistoryService],
})
export class UserExerciseHistoryModule {}
