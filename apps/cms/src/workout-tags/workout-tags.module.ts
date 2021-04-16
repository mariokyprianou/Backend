import { Module } from '@nestjs/common';
import { TaxonomyModule } from '@lib/taxonomy';
import { WorkoutTagCmsResolver } from './workout-tags.cms.resolver';

@Module({
  imports: [TaxonomyModule],
  providers: [WorkoutTagCmsResolver],
})
export class WorkoutTagsCmsModule {}
