import { ArgsType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

@ArgsType()
export class UpdateUserInputDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;

  @IsOptional()
  @IsUUID()
  country: string;

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

  @IsOptional()
  @IsBoolean()
  isManuallySubscribed?: boolean;
}
