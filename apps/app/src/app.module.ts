import { commonConfig } from '@lib/common';
import { databaseConfig, DatabaseModule } from '@lib/database';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { CommonModule } from '../../common/common.module';
import scalars from '../../common/scalars';

import { OnboardingAppModule } from './onboarding/onboarding.module';

const GraphQLProvider = GraphQLModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService) => {
    return {
      debug: configService.get('isDevelopment'),
      playground: configService.get('isDevelopment'),
      include: [CommonModule, OnboardingAppModule],
      typePaths: [
        './apps/app/src/**/*.app.graphql',
        './apps/common/common.graphql',
      ],
      path: '/graphql',
      resolvers: {
        ...scalars,
      },
    };
  },
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [commonConfig, databaseConfig],
    }),
    CommonModule,
    DatabaseModule,
    OnboardingAppModule,
    GraphQLProvider,
  ],
})
export class AppModule {}
