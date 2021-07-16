import { Module } from '@nestjs/common';
import { AuthProviderModule } from '@td/auth-provider';
import {
  ADMIN_AUTH_PROVIDER,
  USER_AUTH_PROVIDER,
} from './administrator.constants';
import { AdministratorService } from './administrator.service';

@Module({
  imports: [
    AuthProviderModule.register({
      name: USER_AUTH_PROVIDER,
      regionKey: 'user.region',
      userpoolKey: 'user.userpool',
    }),
    AuthProviderModule.register({
      name: ADMIN_AUTH_PROVIDER,
      regionKey: 'user.region',
      userpoolKey: 'user.cms_userpool',
    }),
  ],
  providers: [AdministratorService],
  exports: [AdministratorService],
})
export class AdministratorModule {}
