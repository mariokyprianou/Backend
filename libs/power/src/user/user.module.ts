import { Module } from '@nestjs/common';
import { AuthProviderModule } from '@td/auth-provider';
import { UserService } from './user.service';

@Module({
  imports: [
    AuthProviderModule.register({
      name: 'USER',
      regionKey: 'user.region',
      userpoolKey: 'user.userpool',
    }),
    AuthProviderModule.register({
      name: 'ADMIN',
      regionKey: 'user.region',
      userpoolKey: 'user.cms_userpool',
    }),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
