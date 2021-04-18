import { Module } from '@nestjs/common';
import { ExerciseLoaders } from './exercise.loaders';
import { ExerciseService } from './exercise.service';

@Module({
  providers: [ExerciseService, ExerciseLoaders],
  exports: [ExerciseService, ExerciseLoaders],
})
export class ExerciseModule {}
