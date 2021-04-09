import { Module } from '@nestjs/common';
import { WorkoutModule } from '../workout';
import { AccountLoaders } from './account.loaders';
import { AccountService } from './account.service';

@Module({
  imports: [WorkoutModule],
  providers: [AccountService, AccountLoaders],
  exports: [AccountService, AccountLoaders],
})
export class AccountModule {}
