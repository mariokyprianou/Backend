import { Module } from '@nestjs/common';
import { AccountModule } from '../account';
import { ChallengeService } from './challenge.service';

@Module({
  imports: [AccountModule],
  providers: [ChallengeService],
  exports: [ChallengeService],
})
export class ChallengeModule {}
