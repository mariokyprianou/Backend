// import { UserModule } from '@lib/power/user';
import { AuthModule } from '@lib/power/auth';
import { Module } from '@nestjs/common';
import { ProfileResolver } from './profile.resolver';

@Module({
  imports: [AuthModule],
  providers: [ProfileResolver],
})
export class ProfileAuthModule {}
