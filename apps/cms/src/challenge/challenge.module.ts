import { Module } from '@nestjs/common';
import { ChallengeResolver } from './challenge.cms.resolver';
import { ChallengeModule } from '@lib/power/challenge/challenge.module';

@Module({
  imports: [ChallengeModule],
  providers: [ChallengeResolver],
})
export class ChallengeCMSModule {}
