import { Module } from '@nestjs/common';
import { AuthProviderModule } from '@td/auth-provider';
import { AdministratorService } from './administrator.service';

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
  providers: [AdministratorService],
  exports: [AdministratorService],
})
export class AdministratorModule {}
