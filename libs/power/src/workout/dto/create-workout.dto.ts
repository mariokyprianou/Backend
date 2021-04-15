import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { WorkoutIntensity, IWorkoutExercise } from '../workout.interface';
import { WorkoutLocalisationDto } from './workout-localisation.dto';

export class CreateWorkoutDto {
  @IsInt()
  @Min(0)
  duration: number;

  exercises: IWorkoutExercise[];

  @IsEnum(WorkoutIntensity)
  intensity: WorkoutIntensity;

  @IsBoolean()
  isContinuous = false;

  @Type(() => WorkoutLocalisationDto)
  @ValidateNested()
  localisations: WorkoutLocalisationDto[];

  @IsInt()
  orderIndex: number;

  @IsOptional()
  @IsString()
  overviewImageKey?: string;

  @IsUUID()
  programme: string;
}
