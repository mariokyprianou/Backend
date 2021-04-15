import { ArgsType } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';
import { CreateWorkoutDto } from '../../workout';

@ArgsType()
export class CreateScheduledWorkoutDto extends CreateWorkoutDto {
  @IsInt()
  @Min(0)
  weekNumber: number;
}
