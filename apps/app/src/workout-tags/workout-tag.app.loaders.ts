/* eslint-disable @typescript-eslint/no-unused-vars */
import { CONTEXT } from '@nestjs/graphql';
import { TaxonomyService, ITaxonomyTerm } from '@lib/taxonomy';
import { Inject, Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { GQLContext } from '../context';

@Injectable({ scope: Scope.REQUEST })
export class WorkoutTagLoaders {
  constructor(
    @Inject(CONTEXT) private context: GQLContext,
    private readonly taxonomyService: TaxonomyService,
  ) {}

  public readonly findTagsByWorkoutId = new DataLoader<string, ITaxonomyTerm[]>(
    async (ids) => {
      const terms = await this.taxonomyService.findTermsByModelIds(
        ids as string[],
        {
          joinTable: {
            tableName: 'workout_tag',
            modelIdColumn: 'workout_id',
          },
          language: this.context.language,
        },
      );

      return ids.map((id) => terms[id] ?? []);
    },
  );
}
