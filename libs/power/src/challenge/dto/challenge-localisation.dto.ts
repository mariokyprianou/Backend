import { IsLocale, IsString, MinLength } from 'class-validator';

export class ChallengeLocalisationDto {
  @IsLocale()
  language: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  fieldTitle: string;

  @IsString()
  @MinLength(1)
  fieldDescription: string;
}
