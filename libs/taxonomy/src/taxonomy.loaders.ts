import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';

@Injectable({ scope: Scope.REQUEST })
export class TaxonomyLoaders {
  private readonly language: string;

  constructor(@Inject(CONTEXT) context: { language: string }) {
    this.language = context.language;
  }
}
