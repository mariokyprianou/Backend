import { Module } from '@nestjs/common';
import { ScheduledWorkoutModule } from '../scheduled-workout';
import { AccountLoaders } from './account.loaders';
import { AccountService } from './account.service';

@Module({
  imports: [ScheduledWorkoutModule],
  providers: [AccountService, AccountLoaders],
  exports: [AccountService, AccountLoaders],
})
export class AccountModule {}
