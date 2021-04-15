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
export class CreateProgrammeDto {
  @IsUUID()
  trainerId: string;

  @IsInt()
  @Min(0)
  @Max(100)
  fatLoss: number;

  @IsInt()
  @Min(0)
  @Max(100)
  fitness: number;

  @IsInt()
  @Min(0)
  @Max(100)
  muscle: number;

  @IsOptional() // TODO: after CMS ui update this can be non-optional
  @IsInt()
  @Min(0)
  @Max(100)
  wellness = 0;

  @IsOptional() // TODO: after CMS ui update this can be non-optional
  @IsInt()
  @Min(0)
  weeksAvailable = 0;

  @IsString()
  @IsIn(Object.values(ProgrammeEnvironment))
  environment: ProgrammeEnvironment;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(PublishStatus))
  status: PublishStatus = PublishStatus.DRAFT;

  images: ProgrammeImages[];
  localisations: ProgrammeLocalisation[];
  shareMediaImages: ShareMediaImage[];
}
