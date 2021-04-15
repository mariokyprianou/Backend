import {
  ProgrammeEnvironment,
  ProgrammeImages,
  ProgrammeLocalisation,
  PublishStatus,
} from '@lib/power/types';
import { ArgsType } from '@nestjs/graphql';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ShareMediaImage } from '../../../../../libs/power/src/programme/share-media.interface';

@ArgsType()
export class UpdateProgrammeDto {
  @IsOptional()
  @IsUUID()
  trainerId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  fatLoss?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  fitness?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  muscle?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  wellness?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  weeksAvailable: number;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(ProgrammeEnvironment))
  environment?: ProgrammeEnvironment;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(PublishStatus))
  status?: PublishStatus;

  images?: ProgrammeImages[];
  localisations?: ProgrammeLocalisation[];
  shareMediaImages?: ShareMediaImage[];
}
