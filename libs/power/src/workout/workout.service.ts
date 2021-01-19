import { Injectable } from '@nestjs/common';
import { IProgrammeWorkout } from '../types';
import { ProgrammeWorkout } from './programme-workout.model';
import { Workout } from './workout.model';

@Injectable()
export class WorkoutService {
  private async createWorkout(workout: IProgrammeWorkout) {
    return Workout.query().insertGraphAndFetch({
      trainingProgrammeId: workout.programme,
      overviewImageKey: workout.overviewImageKey,
      intensity: workout.intensity,
      duration: workout.duration,
      localisations: workout.localisations,
      exercises: workout.exercises.map((exercise) => ({
        exerciseId: exercise.exercise,
        setType: exercise.setType,
        orderIndex: exercise.orderIndex,
        sets: exercise.sets.map((set) => ({
          setNumber: set.setNumber,
          quantity: set.quantity,
          restTime: set.restTime,
        })),
      })),
    });
  }

  public findAll(programme?: string) {
    return programme
      ? ProgrammeWorkout.query()
          .where('training_programme_id', programme)
          .withGraphJoined('workout.[localisations, exercises.[sets]]')
      : ProgrammeWorkout.query().withGraphJoined(
          'workout.[localisations, exercises.[sets]]',
        );
  }

  public async create(workout: IProgrammeWorkout) {
    const workoutObj = await this.createWorkout(workout);

    const programmeWorkout = await ProgrammeWorkout.query().insertAndFetch({
      trainingProgrammeId: workout.programme,
      weekNumber: workout.weekNumber,
      orderIndex: workout.orderIndex,
      workoutId: workoutObj.id,
    });

    return this.findById(programmeWorkout.id);
  }

  public count(programme?: string) {
    return programme
      ? ProgrammeWorkout.query()
          .where('training_programme_id', programme)
          .count()
      : ProgrammeWorkout.query().count();
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }

  public async update(id: string, workout: IProgrammeWorkout) {
    const workoutObj = await this.createWorkout(workout);

    await ProgrammeWorkout.query()
      .update({
        workoutId: workoutObj.id,
      })
      .where('id', id);

    return this.findById(id);
  }

  public async delete(id: string) {
    // We only delete the programme week version because we need the version control for users
    return ProgrammeWorkout.query().deleteById(id);
  }
}
