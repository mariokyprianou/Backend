import { Injectable } from '@nestjs/common';
import { PartialModelObject, ref } from 'objection';
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
  ): Promise<Workout> {
    const workout = await this.baseQuery(opts).findById(id);
    return workout?.workout;
  }

  public async findAll(
    opts: { language?: string; tagIds?: string[] } = {},
  ): Promise<Workout[]> {
    const query = this.baseQuery(opts);
    if (opts.tagIds) {
      query.whereExists(
        Workout.relatedQuery('tags').whereIn('tags.id', opts.tagIds),
      );
    }
    const workouts = await query.orderBy(ref('created_at'), 'DESC');

    return workouts.map((w) => w.workout);
  }

  public async completeOnDemandWorkout(
    accountId: string,
    params: CompleteWorkoutDto,
  ): Promise<void> {
    await OnDemandWorkout.query()
      .select(1)
      .findOne('workout_id', params.workoutId)
      .throwIfNotFound({ id: params.workoutId });

    await UserWorkout.transaction(async (trx) => {
      await UserWorkout.query(trx).insert({
        accountId,
        type: WorkoutType.ON_DEMAND,
        completedAt: new Date(),
        workoutId: params.workoutId,
        orderIndex: 0,
      });

      const weightsUsed = (params.weightsUsed ?? []).map<
        PartialModelObject<UserExerciseHistory>
      >((record) => ({
        accountId,
        exerciseId: record.exerciseId,
        setType: record.setType,
        setNumber: record.setNumber,
        quantity: record.quantity,
        weight: record.weight,
        completedAt: record.date,
      }));
      await UserExerciseHistory.query(trx).insert(weightsUsed);
    });

    try {
      await this.workoutFeedbackService.saveWorkoutFeedback(accountId, params);
    } catch (e) {}
  }
}
