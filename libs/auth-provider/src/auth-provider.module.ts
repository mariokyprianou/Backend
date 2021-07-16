import { FactoryProvider, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthProviderService } from './auth-provider.service';

@Module({})
export class AuthProviderModule {
  static register(options: {
    regionKey: string;
    userpoolKey: string;
    name: string;
    clientId?: string;
  }) {
    return {
      module: AuthProviderModule,
      import: [ConfigModule],
      providers: [
        {
          provide: options.name,
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            return new AuthProviderService({
              region: configService.get(options.regionKey),
              userpoolId: configService.get(options.userpoolKey),
              clientId: configService.get(options.clientId),
            });
          },
        } as FactoryProvider,
      ],
      exports: [options.name],
    };
  }
}
