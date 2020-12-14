import { FactoryProvider, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { AuthProviderService } from './authProvider.service';

const authProvider: FactoryProvider = {
  provide: 'AUTH_PROVIDER',
  useFactory: async (config: ConfigService) => {
    return {
      cognito: new CognitoIdentityServiceProvider({
        region: config.get('auth.region'), // or whatever
      }),
      config: config.get('auth'),
    };
  },
  inject: [ConfigService],
};

@Module({
  imports: [],
  providers: [authProvider, AuthProviderService],
  exports: [authProvider, AuthProviderService],
})
export class AuthProviderModule {}
