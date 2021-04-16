import { Module } from '@nestjs/common';
import { TaxonomyCmsService } from './taxonomy.cms.service';
import { TaxonomyLoaders } from './taxonomy.loaders';
import { TaxonomyService } from './taxonomy.service';

@Module({
  providers: [TaxonomyCmsService, TaxonomyService, TaxonomyLoaders],
  exports: [TaxonomyCmsService, TaxonomyService, TaxonomyLoaders],
})
export class TaxonomyModule {}
