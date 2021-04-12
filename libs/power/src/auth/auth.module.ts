import { Module } from '@nestjs/common';
import { AuthProviderModule } from '@td/auth-provider';
import { AccountModule } from '../account';
import { UserModule } from '../user';
import { UserPowerModule } from '../user-power';
import { UserProgrammeModule } from '../user-programme';
import { UserWorkoutModule } from '../user-workout';
import { UserWorkoutWeekModule } from '../user-workout-week';
import { AuthService } from './auth.service';

@Module({
  imports: [
    AuthProviderModule.register({
      name: 'USER',
      regionKey: 'user.region',
      userpoolKey: 'user.userpool',
      clientId: 'user.app_backend_client',
    }),
    AuthProviderModule.register({
      name: 'ADMIN',
      regionKey: 'user.region',
      userpoolKey: 'user.cms_userpool',
    }),
    AccountModule,
    UserModule,
    UserWorkoutModule,
    UserWorkoutWeekModule,
    UserProgrammeModule,
    UserPowerModule,
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
