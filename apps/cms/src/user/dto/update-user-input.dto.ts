import { ArgsType } from '@nestjs/graphql';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { UpdateUserInput } from '../user.resolver';

@ArgsType()
export class UpdateUserInputDto implements UpdateUserInput {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;

  @IsUUID()
  country: string;

  @IsOptional()
  @IsUUID()
  region: string;

  @IsString()
  timezone: string;

  @IsDate()
  deviceLimit: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  currentWeek?: number;

  @IsOptional()
  @IsUUID()
  trainingProgrammeId?: string;
}
