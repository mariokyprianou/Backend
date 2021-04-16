import { ArgsType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsLocale,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

@ArgsType()
export class CreateTaxonomyTermDto {
  @IsOptional()
  @IsString()
  key?: string;

  @Type(() => TaxonomyTermLocalisationDto)
  @ValidateNested()
  localisations: TaxonomyTermLocalisationDto[];
}

export class TaxonomyTermLocalisationDto {
  @IsLocale()
  language: string;
  @IsString()
  name: string;
}
