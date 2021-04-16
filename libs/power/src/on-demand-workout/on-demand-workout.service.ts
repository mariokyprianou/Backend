import { Injectable } from '@nestjs/common';
import { ref } from 'objection';
import { OnDemandWorkout } from './on-demand-workout.model';

@Injectable()
export class OnDemandWorkoutService {
  private baseQuery(opts: { language?: string }) {
    return OnDemandWorkout.query()
      .withGraphJoined('workout.localisations')
      .modifyGraph('workout.localisations', (qb) =>
        qb.where(ref('language'), opts.language ?? 'en'),
      );
  }

  public findById(
    id: string,
    opts: { language?: string } = {},
  ): Promise<OnDemandWorkout> {
    return this.baseQuery(opts).findById(id);
  }

  public findAll(opts: { language?: string } = {}): Promise<OnDemandWorkout[]> {
    return this.baseQuery(opts).orderBy(ref('created_at'), 'DESC');
  }
}
