import { ChallengeModule } from '@lib/power/challenge';
import { Module } from '@nestjs/common';
import { ChallengeResolver } from './challenge.resolver';

@Module({
  imports: [ChallengeModule],
  providers: [ChallengeResolver],
})
export class ChallengeAuthModule {}
