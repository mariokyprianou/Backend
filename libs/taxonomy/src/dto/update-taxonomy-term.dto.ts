import { ArgsType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { TaxonomyTermLocalisationDto } from './create-taxonomy-term.dto';

@ArgsType()
export class UpdateTaxonomyTermDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  key?: string;

  @Type(() => TaxonomyTermLocalisationDto)
  @ValidateNested()
  localisations: TaxonomyTermLocalisationDto[];
}
