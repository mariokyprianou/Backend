import {
  ProgrammeModule,
  AccountModule,
  AuthModule,
  UserPowerModule,
  UserProgrammeModule,
  UserModule,
  ScreenshotModule,
} from '@lib/power';
import { SubscriptionModule } from '@td/subscriptions';
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
    ScreenshotModule,
    SubscriptionModule,
  ],
  providers: [UserResolver],
})
export class UserCMSModule {}
