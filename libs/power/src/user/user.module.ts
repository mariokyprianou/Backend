import { Module } from '@nestjs/common';
import { AuthProviderModule } from '@td/auth-provider';
import { UserService } from './user.service';

@Module({
  imports: [AuthProviderModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
