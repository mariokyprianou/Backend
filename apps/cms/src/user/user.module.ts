import { AccountModule } from '@lib/power/account';
import { UserProgrammeModule } from '@lib/power/user-programme/user-programme.module';
import { UserModule } from '@lib/power/user/user.module';
import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';

@Module({
  imports: [UserModule, UserProgrammeModule, AccountModule],
  providers: [UserResolver],
})
export class UserCMSModule {}
