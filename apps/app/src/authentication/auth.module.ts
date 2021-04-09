import { AuthModule, UserModule } from '@lib/power';
import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [UserModule, AuthModule],
  providers: [AuthResolver],
})
export class AuthAppModule {}
