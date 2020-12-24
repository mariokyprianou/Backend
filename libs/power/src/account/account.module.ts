import { Module } from '@nestjs/common';
import { WorkoutService } from '../workout';
import { AccountService } from './account.service';

@Module({
  providers: [AccountService, WorkoutService],
  exports: [AccountService],
})
export class AccountModule {}
