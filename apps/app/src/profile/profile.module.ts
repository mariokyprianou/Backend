import { AuthModule } from '@lib/power';
import { Module } from '@nestjs/common';
import { ProfileResolver } from './profile.resolver';

@Module({
  imports: [AuthModule],
  providers: [ProfileResolver],
})
export class ProfileAuthModule {}
