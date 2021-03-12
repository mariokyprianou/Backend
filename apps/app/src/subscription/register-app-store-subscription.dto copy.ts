import { ArgsType } from '@nestjs/graphql';
import { IsBase64 } from 'class-validator';

@ArgsType()
export class RegisterAppStoreSubscriptionDto {
  @IsBase64()
  receiptData: string;
}
