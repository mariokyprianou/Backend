import { Module } from '@nestjs/common';
import { AuthProviderService } from './auth-provider.service';

// @Module({
//   imports: [ConfigModule],
//   providers: [AuthProviderService],
//   exports: [AuthProviderService],
// })
// export class AuthProviderModule {}

@Module({})
export class AuthProviderModule {
  static register(options: { region: string; userpool: string; name: string }) {
    return {
      module: AuthProviderModule,
      providers: [
        {
          provide: 'AUTH_OPTIONS',
          useValue: options,
        },
        {
          provide: options.name,
          useClass: AuthProviderService,
          // useFactory: () => AuthProviderService,
        },
      ],
      inject: [AuthProviderService],
      exports: [options.name],
    };
  }
}
