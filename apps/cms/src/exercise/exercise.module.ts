import { CommonModule } from '@lib/common';
import { ExerciseModule } from '@lib/power/exercise/exercise.module';
import { Module } from '@nestjs/common';
import { ExerciseCmsLoaders } from './exercise.cms.loaders';
import { ExerciseResolver } from './exercise.resolver';

@Module({
  imports: [ExerciseModule, CommonModule],
  providers: [ExerciseResolver, ExerciseCmsLoaders],
  exports: [ExerciseCmsLoaders],
})
export class ExerciseCMSModule {}
