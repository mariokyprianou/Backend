import { ArgsType } from '@nestjs/graphql';
import { IsJWT } from 'class-validator';

@ArgsType()
export class ConfirmUploadProgressImageDto {
  @IsJWT()
  token: string;
}
