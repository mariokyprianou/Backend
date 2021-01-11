/*
 * Author: Joseph Clough (joseph.clough@thedistance.co.uk)
 * Created: Thu, 17th December 202020
 * Copyright 2020 - The Distance
 */
import { commonConfig } from '@lib/common';
import { databaseConfig, DatabaseModule } from '@lib/database';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { AuthProviderModule } from '@td/auth-provider';
import userAuthKeysConfig from '../../common/user-auth-keys.config';
import { CommonModule } from '../../common/common.module';
import scalars from '../../common/scalars';
import { AuthAppModule } from './authentication/auth.module';
import { ConfigAppModule } from './config/config.module';
import { CountryAppModule } from './country/region.module';
import { createContext } from './createContext';
import { HMCAppModule } from './hmc/hmc.module';

import { OnboardingAppModule } from './onboarding/onboarding.module';
import { RegionAppModule } from './region/region.module';
import { TimeZoneAppModule } from './timeZone/timeZone.module';
import { TrainerAppModule } from './trainer/trainer.module';
import { ProfileAuthModule } from './profile/profile.module';
import { UserProgrammeAuthModule } from './userProgramme/userProgramme.module';

const GraphQLProvider = GraphQLModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService) => {
    return {
      debug: configService.get('isDevelopment'),
      playground: configService.get('isDevelopment'),
      include: [
        CommonModule,
        OnboardingAppModule,
        ConfigAppModule,
        TrainerAppModule,
        HMCAppModule,
        TimeZoneAppModule,
        RegionAppModule,
        CountryAppModule,
        AuthAppModule,
        ProfileAuthModule,
        UserProgrammeAuthModule,
      ],
      typePaths: [
        './apps/app/src/**/*.app.graphql',
        './apps/app/src/**/*.auth.graphql',
        './apps/common/common.graphql',
      ],
      path: '/auth',
      resolvers: {
        ...scalars,
      },
      context: createContext,
    };
  },
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [commonConfig, databaseConfig, userAuthKeysConfig],
    }),
    CommonModule,
    DatabaseModule,
    OnboardingAppModule,
    ConfigAppModule,
    TrainerAppModule,
    HMCAppModule,
    TimeZoneAppModule,
    RegionAppModule,
    CountryAppModule,
    AuthAppModule,
    AuthProviderModule,
    ProfileAuthModule,
    UserProgrammeAuthModule,
    GraphQLProvider,
  ],
})
export class AuthModule {}
