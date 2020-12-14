import { AccountModule } from '@lib/power/account';
import { UserProgramModule } from '@lib/power/user-program/user-program.module';
import { UserModule } from '@lib/power/user/user.module';
import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';

@Module({
  imports: [UserModule, UserProgramModule, AccountModule],
  providers: [UserResolver],
})
export class UserCMSModule {}
