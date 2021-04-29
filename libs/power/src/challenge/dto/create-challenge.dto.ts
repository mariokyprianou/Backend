import { ArgsType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ChallengeType, ChallengeUnitType } from '../challenge.interface';
import { ChallengeLocalisationDto } from './challenge-localisation.dto';

@ArgsType()
export class CreateChallengeDto {
  @IsUUID()
  trainingProgrammeId: string;

  @IsEnum(ChallengeType)
  type: ChallengeType;

  @IsOptional()
  @IsEnum(ChallengeUnitType)
  unitType: ChallengeUnitType;

  @IsOptional()
  @IsInt()
  @IsPositive()
  duration: number;

  @IsOptional()
  @IsString()
  imageKey: string;

  @ValidateNested()
  @Type(() => ChallengeLocalisationDto)
  localisations: ChallengeLocalisationDto[];
}
