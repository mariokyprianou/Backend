import { AccountModule } from '@lib/power/account';
import { AuthModule } from '@lib/power/auth';
import { UserProgrammeModule } from '@lib/power/user-programme/user-programme.module';
import { UserModule } from '@lib/power/user/user.module';
import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';

@Module({
  imports: [UserModule, UserProgrammeModule, AccountModule, AuthModule],
  providers: [UserResolver],
})
export class UserCMSModule {}
