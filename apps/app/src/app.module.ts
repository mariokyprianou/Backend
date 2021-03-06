import { commonConfig, formatError } from '@lib/common';
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
import { createContext } from './context';
import { HMCAppModule } from './hmc/hmc.module';

import { OnboardingAppModule } from './onboarding/onboarding.module';
import { RegionAppModule } from './region/region.module';
import { TrainerAppModule } from './trainer/trainer.module';
import { ProgrammeAppModule } from './programme/programme.app.module';
import { WorkoutAppModule } from './workout/workout.app.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  appStoreSubscriptionConfig,
  googlePlaySubscriptionConfig,
} from '@td/subscriptions';

const GraphQLProvider = GraphQLModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService) => {
    return {
      debug: configService.get('isDevelopment'),
      playground: configService.get('isDevelopment'),
      include: [
        AuthAppModule,
        CommonModule,
        ConfigAppModule,
        CountryAppModule,
        HMCAppModule,
        OnboardingAppModule,
        ProgrammeAppModule,
        RegionAppModule,
        TrainerAppModule,
        WorkoutAppModule,
      ],
      typePaths: [
        './apps/app/src/**/*.app.graphql',
        './apps/common/common.graphql',
      ],
      path: '/graphql',
      resolvers: {
        ...scalars,
      },
      formatError,
      context: createContext,
    };
  },
});

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        commonConfig,
        databaseConfig,
        userAuthKeysConfig,
        googlePlaySubscriptionConfig,
        appStoreSubscriptionConfig,
      ],
    }),
    AuthAppModule,
    AuthProviderModule,
    CommonModule,
    ConfigAppModule,
    CountryAppModule,
    DatabaseModule,
    GraphQLProvider,
    HMCAppModule,
    OnboardingAppModule,
    ProgrammeAppModule,
    RegionAppModule,
    TrainerAppModule,
    WorkoutAppModule,
  ],
})
export class AppModule {}
