import { UserPowerModule } from '@lib/power/user-power';
import { Module } from '@nestjs/common';
import { UserProgrammeResolver } from './userProgramme.resolver';

@Module({
  imports: [UserPowerModule],
  providers: [UserProgrammeResolver],
})
export class UserProgrammeAuthModule {}
