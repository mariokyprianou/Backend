import { Module } from '@nestjs/common';
import { ExerciseLoaders } from './exercise.loaders';
import { ExerciseCmsService } from './exercise.cms.service';

@Module({
  providers: [ExerciseCmsService, ExerciseLoaders],
  exports: [ExerciseCmsService, ExerciseLoaders],
})
export class ExerciseModule {}
