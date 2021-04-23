import * as DataLoader from 'dataloader';
import * as _ from 'lodash';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { ScheduledWorkout } from '../scheduled-workout/scheduled-workout.model';
import { CONTEXT } from '@nestjs/graphql';
import { TaxonomyTerm } from '@lib/taxonomy';
import { Workout } from './workout.model';

@Injectable({ scope: Scope.REQUEST })
export class WorkoutLoaders {
  private readonly language: string;

  constructor(@Inject(CONTEXT) context: { language: string }) {
    this.language = context.language ?? 'en';
  }

  public readonly findWorkoutTagIdsByWorkoutId = new DataLoader<
    string,
    TaxonomyTerm[]
  >(async (workoutIds) => {
    const results = await Workout.knex()
      .select('workout_id', 'taxonomy_term_id')
      .from('workout_tag')
      .whereIn('workout_id', workoutIds);
    return workoutIds.map((workoutId) =>
      results
        .filter((result) => result.workout_id === workoutId)
        .map((result) => result.taxonomy_term_id),
    );
  });

  public readonly findWorkoutsByProgrammeAndWeek = new DataLoader<
    [programmeId: string, week: number],
    ScheduledWorkout[]
  >(async (ids) => {
    const idsByProgramme = _.groupBy(ids, ([programmeId]) => programmeId);
    const query = ScheduledWorkout.query()
      .alias('sw')
      .withGraphJoined('workout.localisations')
      .where('workout:localisations.language', this.language)
      .orderBy('sw.training_programme_id')
      .orderBy('sw.week_number')
      .orderBy('sw.order_index');

    Object.entries(idsByProgramme).forEach(([programmeId, ids]) => {
      const weekNumbers = ids.map((id) => id[1]);
      query.orWhere((qb) =>
        qb
          .where('sw.training_programme_id', programmeId)
          .whereIn('sw.week_number', weekNumbers),
      );
    });
    const results = await query;

    return ids.map(([programmeId, weekNumber]) => {
      return results.filter(
        (programmeWorkout) =>
          programmeWorkout.trainingProgrammeId === programmeId &&
          programmeWorkout.weekNumber === weekNumber,
      );
    });
  });
}
