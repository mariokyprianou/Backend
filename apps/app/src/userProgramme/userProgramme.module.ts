import { UserExerciseHistoryModule } from '@lib/power/user-exercise-history/user-exercise-history.module';
import { UserPowerModule } from '@lib/power/user-power';
import { Module } from '@nestjs/common';
import { UserProgrammeResolver } from './userProgramme.resolver';

@Module({
  imports: [UserPowerModule, UserExerciseHistoryModule],
  providers: [UserProgrammeResolver],
})
export class UserProgrammeAuthModule {}
