import { Module } from '@nestjs/common';
import { CommonModule } from '@lib/common';
import { WorkoutWeekResolver } from './workout-week.resolver';
import { WorkoutResolver } from './workout.resolver';

@Module({
  imports: [CommonModule],
  providers: [WorkoutResolver, WorkoutWeekResolver],
})
export class WorkoutAppModule {}
