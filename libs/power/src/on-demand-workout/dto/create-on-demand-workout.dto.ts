import { ArgsType } from '@nestjs/graphql';
import { CreateWorkoutDto } from '../../workout';

@ArgsType()
export class CreateOnDemandWorkoutDto extends CreateWorkoutDto {}
