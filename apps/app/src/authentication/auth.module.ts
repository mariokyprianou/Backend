import { AuthModule } from '@lib/power/auth';
import { UserModule } from '@lib/power/user';
import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [UserModule, AuthModule],
  providers: [AuthResolver],
})
export class AuthAppModule {}
