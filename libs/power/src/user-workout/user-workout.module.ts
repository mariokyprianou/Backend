import { Module } from '@nestjs/common';
import { UserWorkoutCmsService } from './user-workout.cms.service';

@Module({
  providers: [UserWorkoutCmsService],
  exports: [UserWorkoutCmsService],
})
export class UserWorkoutModule {}
