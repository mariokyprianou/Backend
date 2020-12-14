import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthProviderService } from './auth-provider.service';

// @Module({
//   imports: [ConfigModule],
//   providers: [AuthProviderService],
//   exports: [AuthProviderService],
// })
// export class AuthProviderModule {}

@Module({})
export class AuthProviderModule {
  static register(options: { regionKey: string; userpoolKey: string; name: string }) {
    return {
      module: AuthProviderModule,
      import: [ConfigModule],
      providers: [
        {
          provide: 'AUTH_OPTIONS',
          useValue: options,
        },
        {
          provide: options.name,
          useClass: AuthProviderService,
        },
      ],
      inject: [AuthProviderService, ConfigService],
      exports: [options.name],
    };
  }
}
