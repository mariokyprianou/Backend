import { AuthModule } from '@lib/power/auth';
import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [AuthModule],
  providers: [AuthResolver],
})
export class AuthAppModule {}
