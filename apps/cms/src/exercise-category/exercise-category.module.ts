import { ExerciseCategoryModule } from '@lib/power/exercise-category';
import { Module } from '@nestjs/common';
import { ExerciseCategoryResolver } from './exercise-category.resolver';

@Module({
  imports: [ExerciseCategoryModule],
  providers: [ExerciseCategoryResolver],
})
export class ExerciseCategoryCMSModule {}
