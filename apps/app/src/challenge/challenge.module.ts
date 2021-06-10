import { CommonModule } from '@lib/common';
import { ChallengeModule } from '@lib/power/challenge';
import { Module } from '@nestjs/common';
import { ChallengeResolver } from './challenge.resolver';

@Module({
  imports: [CommonModule, ChallengeModule],
  providers: [ChallengeResolver],
})
export class ChallengeAuthModule {}
