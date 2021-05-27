import { Injectable } from '@nestjs/common';
import { PartialModelObject, ref } from 'objection';
import { Account } from '../account';
import { WorkoutFeedbackService } from '../feedback';
import { UserExerciseHistory } from '../user-exercise-history';
import { CompleteWorkoutDto } from '../user-power/dto/complete-workout.dto';
import { UserWorkout } from '../user-workout';
import { Workout, WorkoutType } from '../workout';
import { OnDemandWorkout } from './on-demand-workout.model';

@Injectable()
export class OnDemandWorkoutService {
  constructor(
    private readonly workoutFeedbackService: WorkoutFeedbackService,
  ) {}

  private baseQuery(opts: { language?: string } = {}) {
    return OnDemandWorkout.query()
      .withGraphJoined('workout.localisations')
      .modifyGraph('workout.localisations', (qb) =>
        qb.where(ref('language'), opts.language ?? 'en'),
      );
  }

  public async findById(
    id: string,
    opts: { language?: string } = {},
  ): Promise<OnDemandWorkout> {
    return this.baseQuery(opts).findById(id);
  }

  public async findAll(
    opts: { language?: string; tagIds?: string[] } = {},
  ): Promise<OnDemandWorkout[]> {
    const query = this.baseQuery(opts);
    if (opts.tagIds) {
      query.whereExists(
        Workout.relatedQuery('tags').whereIn('tags.id', opts.tagIds),
      );
    }

    return query.orderBy(ref('created_at'), 'DESC');
  }

  public async startOnDemandWorkout(accountId: string) {
    const { workoutsCompleted } = await Account.query()
      .findById(accountId)
      .increment('workouts_completed', 1)
      .returning(['id', 'workouts_completed']);

    return { workoutsCompleted };
  }

  public async completeOnDemandWorkout(
    accountId: string,
    params: CompleteWorkoutDto,
  ): Promise<void> {
    // The id passed up as actually specific to the on_demand table, not the workout.
    const { workoutId: onDemandWorkoutId } = params;

    const { workoutId } = await OnDemandWorkout.query()
      .select('workout_id')
      .findById(onDemandWorkoutId)
      .throwIfNotFound({ id: onDemandWorkoutId });

    const userWorkoutId = await UserWorkout.transaction(async (trx) => {
      const userWorkout = await UserWorkout.query(trx)
        .insert({
          accountId,
          type: WorkoutType.ON_DEMAND,
          completedAt: new Date(),
          workoutId,
          orderIndex: 0,
        })
        .returning('id');

      const weightsUsed = (params.weightsUsed ?? []).map<
        PartialModelObject<UserExerciseHistory>
      >((record) => ({
        accountId,
        exerciseId: record.exerciseId,
        setType: record.setType,
        setNumber: record.setNumber,
        quantity: record.quantity,
        weight: record.weight,
        completedAt: record.completedAt ?? params.date,
      }));
      await UserExerciseHistory.query(trx).insert(weightsUsed);

      return userWorkout.id;
    });

    try {
      params.workoutId = userWorkoutId;
      await this.workoutFeedbackService.saveWorkoutFeedback(accountId, params);
    } catch (e) {
      console.log('saveFeedback', 'error', e);
    }
  }
}
