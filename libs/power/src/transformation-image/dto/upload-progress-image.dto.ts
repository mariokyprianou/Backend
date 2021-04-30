import { ArgsType } from '@nestjs/graphql';
import { Contains, IsDate, IsMimeType } from 'class-validator';

@ArgsType()
export class UploadProgressImageDto {
  @IsMimeType()
  @Contains('image/')
  contentType: string;

  @IsDate()
  date: Date;
}
