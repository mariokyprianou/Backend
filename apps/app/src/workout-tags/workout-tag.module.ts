import { Module } from '@nestjs/common';
import { WorkoutTagResolver } from './workout-tag.app.resolver';
import { TaxonomyModule } from '@lib/taxonomy';

@Module({
  imports: [TaxonomyModule],
  providers: [WorkoutTagResolver],
})
export class WorkoutTagAppModule {}
