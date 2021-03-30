import { CommonModule } from '@lib/common';
import { ExerciseModule } from '@lib/power/exercise/exercise.module';
import { Module } from '@nestjs/common';
import { ExerciseLoaders } from './exercise.loader';
import { ExerciseResolver } from './exercise.resolver';

@Module({
  imports: [ExerciseModule, CommonModule],
  providers: [ExerciseResolver, ExerciseLoaders],
  exports: [ExerciseLoaders],
})
export class ExerciseCMSModule {}
