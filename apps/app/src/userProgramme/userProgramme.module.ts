import { UserExerciseHistoryModule } from '@lib/power/user-exercise-history/user-exercise-history.module';
import { UserExerciseNoteModule } from '@lib/power/user-exercise-note/user-exercise-note.module';
import { UserPowerModule } from '@lib/power/user-power';
import { Module } from '@nestjs/common';
import { UserProgrammeResolver } from './userProgramme.resolver';

@Module({
  imports: [UserPowerModule, UserExerciseHistoryModule, UserExerciseNoteModule],
  providers: [UserProgrammeResolver],
})
export class UserProgrammeAuthModule {}
