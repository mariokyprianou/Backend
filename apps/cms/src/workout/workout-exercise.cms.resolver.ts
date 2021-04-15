import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { WorkoutExercise } from '@lib/power';

@Resolver('WorkoutExercise')
export class WorkoutExerciseCmsResolver {
  @ResolveField('setType')
  getSetType(@Parent() workoutExercise: WorkoutExercise) {
    return workoutExercise.setType;
  }

  @ResolveField('orderIndex')
  getOrderIndex(@Parent() workoutExercise: WorkoutExercise) {
    return workoutExercise.orderIndex;
  }

  @ResolveField('localisations')
  getLocalisations(@Parent() workoutExercise: WorkoutExercise) {
    return workoutExercise.localisations;
  }

  @ResolveField('sets')
  getSets(@Parent() workoutExercise: WorkoutExercise) {
    return workoutExercise.sets;
  }

  @ResolveField('exercise')
  getExercise(@Parent() workoutExercise: WorkoutExercise) {
    return workoutExercise.exercise;
  }
}
