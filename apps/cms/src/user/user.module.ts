import { ProgrammeModule } from '@lib/power';
import { AccountModule } from '@lib/power/account';
import { AuthModule } from '@lib/power/auth';
import { UserPowerModule } from '@lib/power/user-power';
import { UserProgrammeModule } from '@lib/power/user-programme/user-programme.module';
import { UserModule } from '@lib/power/user/user.module';
import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';

@Module({
  imports: [
    UserModule,
    UserProgrammeModule,
    AccountModule,
    AuthModule,
    UserPowerModule,
    ProgrammeModule,
  ],
  providers: [UserResolver],
})
export class UserCMSModule {}
