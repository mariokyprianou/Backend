import { IWorkoutLocalisation } from '../../workout';
import { ArgsType } from '@nestjs/graphql';
import { IsString, Length, MinLength } from 'class-validator';

@ArgsType()
export class WorkoutLocalisationDto implements IWorkoutLocalisation {
  @IsString()
  @Length(2)
  language: string;

  @IsString()
  @MinLength(1)
  name: string;
}
