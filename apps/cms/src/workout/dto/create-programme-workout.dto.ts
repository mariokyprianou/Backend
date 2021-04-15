import {
  IntensityEnum,
  ProgrammeWorkoutLocalisations,
  WorkoutExercise,
} from '@lib/power/types';
import { ArgsType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

@ArgsType()
export class CreateProgrammeWorkoutDto {
  @IsInt()
  @Min(0)
  duration: number;

  exercises: WorkoutExercise[];

  @IsEnum(IntensityEnum)
  intensity: IntensityEnum;

  @IsBoolean()
  isContinuous = false;

  localisations: ProgrammeWorkoutLocalisations[];

  @IsInt()
  orderIndex: number;

  @IsOptional()
  @IsString()
  overviewImageKey?: string;

  @IsUUID()
  programme: string;

  @IsInt()
  @Min(0)
  weekNumber: number;
}
