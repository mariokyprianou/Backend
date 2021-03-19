// import { UserModule } from '@lib/power/user';
import { CommonModule } from '@lib/common';
import { AccountModule, ProgrammeModule } from '@lib/power';
import { Module } from '@nestjs/common';
import { ShareMediaResolver } from './shareMedia.resolver';

@Module({
  imports: [AccountModule, CommonModule, ProgrammeModule],
  providers: [ShareMediaResolver],
})
export class ShareMediaAuthModule {}
