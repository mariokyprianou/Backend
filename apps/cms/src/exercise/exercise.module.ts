import { CommonModule } from '@lib/common';
import { ExerciseModule } from '@lib/power/exercise/exercise.module';
import { Module } from '@nestjs/common';
import { ExerciseResolver } from './exercise.resolver';

@Module({
  imports: [ExerciseModule, CommonModule],
  providers: [ExerciseResolver],
})
export class ExerciseCMSModule {}
