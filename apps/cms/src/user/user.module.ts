import { UserModule } from '@lib/power/user/user.module';
import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';

@Module({
  imports: [UserModule],
  providers: [UserResolver],
})
export class UserCMSModule {}
