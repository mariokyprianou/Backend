import { ArgsType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@ArgsType()
export class RegisterGooglePlaySubscriptionDto {
  @IsString()
  productId: string;

  @IsString()
  purchaseToken: string;
}
