import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Workout } from '@lib/power/workout';
import { CommonService } from '@lib/common';
import { ExerciseLoaders } from '../exercise/exercise.loader';
import { Exercise } from '@lib/power/exercise';

@Resolver('Workout')
export class WorkoutResolver {
  constructor(
    private commonService: CommonService,
    private exerciseLoaders: ExerciseLoaders,
  ) {}

  @ResolveField('overviewImage')
  getOverviewImage(@Parent() workout: Workout) {
    if (!workout.overviewImageKey) {
      return null;
    }
    return {
      key: workout.overviewImageKey,
      url: this.commonService.getPresignedUrl(
        workout.overviewImageKey,
        this.commonService.env().FILES_BUCKET,
        'getObject',
      ),
    };
  }

  @ResolveField('intensity')
  getIntensity(@Parent() workout: Workout) {
    return workout.intensity;
  }

  @ResolveField('duration')
  getDuration(@Parent() workout: Workout) {
    return workout.duration;
  }

  @ResolveField('localisations')
  getLocalisations(@Parent() workout: Workout) {
    return workout.localisations;
  }

  @ResolveField('exercises')
  async getExercises(@Parent() workout: Workout) {
    const exercises = await this.exerciseLoaders.findById.loadMany(
      workout.exercises.map((ex) => ex.exerciseId),
    );

    return workout.exercises.map((workoutExercise) => ({
      setType: workoutExercise.setType,
      sets: workoutExercise.sets,
      localisations: workoutExercise.localisations,
      exercise: exercises.find(
        (e) => workoutExercise.exerciseId === (e as Exercise).id,
      ),
      orderIndex: workoutExercise.orderIndex,
    }));
  }
}
