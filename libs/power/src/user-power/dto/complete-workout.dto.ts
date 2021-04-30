import { SetType } from '../../workout';
import { ArgsType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

@ArgsType()
export class CompleteWorkoutDto {
  @IsUUID()
  workoutId: string;

  @IsDate()
  date: Date;

  @IsInt()
  @Min(0)
  @Max(20)
  intensity: number;

  @IsString()
  emoji: string;

  @IsInt()
  @Min(0)
  timeTaken: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkoutSetWeightInputDto)
  weightsUsed: WorkoutSetWeightInputDto[];
}

export class WorkoutSetWeightInputDto {
  @IsUUID()
  exerciseId: string;

  @IsOptional()
  @IsDate()
  completedAt?: Date;

  @Min(0)
  weight: number;

  @IsInt()
  @Min(0)
  @Max(100)
  setNumber: number;

  @IsEnum(SetType)
  setType: SetType;

  @IsInt()
  @Min(0)
  quantity: number;
}
