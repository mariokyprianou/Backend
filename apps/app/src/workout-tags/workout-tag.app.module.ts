import { Module } from '@nestjs/common';
import { WorkoutTagResolver } from './workout-tag.app.resolver';
import { TaxonomyModule } from '@lib/taxonomy';
import { WorkoutTagLoaders } from './workout-tag.app.loaders';

@Module({
  imports: [TaxonomyModule],
  providers: [WorkoutTagResolver, WorkoutTagLoaders],
  exports: [WorkoutTagLoaders],
})
export class WorkoutTagAppModule {}
