import { AuthContext } from '@lib/power';
import { UserPowerLoaders } from '@lib/power/user-power/user-power.loaders';
import { WorkoutExercise } from '@lib/power/workout/workout-exercise.model';
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver('UserWorkoutExercise')
export class UserWorkoutExerciseResolver {
  constructor(private readonly userPowerLoaders: UserPowerLoaders) {}

  @ResolveField('id')
  public async getId(@Parent() exercise: WorkoutExercise) {
    return exercise.id;
  }

  @ResolveField('orderIndex')
  public async getOrderIndex(@Parent() exercise: WorkoutExercise) {
    return exercise.orderIndex;
  }

  @ResolveField('exercise')
  public async getExercise(@Parent() exercise: WorkoutExercise) {
    return exercise.exercise;
  }

  @ResolveField('sets')
  public async getSets(@Parent() exercise: WorkoutExercise) {
    return exercise.sets;
  }

  @ResolveField('setType')
  public async getSetType(@Parent() exercise: WorkoutExercise) {
    return exercise.setType;
  }

  @ResolveField('notes')
  public async getNotes(
    @Parent() exercise: WorkoutExercise,
    @Context('authContext') context: AuthContext,
  ) {
    const note = await this.userPowerLoaders.findUserNoteByAccountAndExercise.load(
      [context.id, exercise.id],
    );
    return note?.note;
  }
}
