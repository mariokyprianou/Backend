import { Module } from '@nestjs/common';
import { ExerciseCategoryService } from './exercise-category.service';

@Module({
  providers: [ExerciseCategoryService],
  exports: [ExerciseCategoryService],
})
export class ExerciseCategoryModule {}
