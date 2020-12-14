import { UserModule } from '@lib/power/user';
import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [UserModule],
  providers: [AuthResolver],
})
export class AuthAppModule {}
