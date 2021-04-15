import { ArgsType } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';
import { UpdateWorkoutDto } from '../../workout';

@ArgsType()
export class UpdateScheduledWorkoutDto extends UpdateWorkoutDto {
  @IsInt()
  @Min(0)
  weekNumber: number;
}
