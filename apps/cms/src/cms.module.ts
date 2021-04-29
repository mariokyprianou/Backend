import { commonConfig, formatError } from '@lib/common';
import { databaseConfig, DatabaseModule } from '@lib/database';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { CommonModule } from '../../common/common.module';
import { TrainerCMSModule } from './trainer/trainer.module';
import scalars from '../../common/scalars';
import { ExerciseCMSModule } from './exercise/exercise.module';
import { ExerciseCategoryCMSModule } from './exercise-category/exercise-category.module';
import { ProgrammeCMSModule } from './programme/programme.cms.module';
import { HmcQuestionCMSModule } from './hmc-question/hmc-question.cms.module';
import { WorkoutCMSModule } from './workout/workout.cms.module';
import { FeedbackCMSModule } from './feedback/feedback.module';
import { ConfigCMSModule } from './config/config.module';
import { ChallengeCMSModule } from './challenge/challenge.module';
import { UserCMSModule } from './user/user.module';
import { AdministratorCMSModule } from './administrator/administrator.module';
import { WorkoutTagsCmsModule } from './workout-tags/workout-tags.module';
import { RegionCMSModule } from './region/region.module';
import { CountryCMSModule } from './country/region.module';
import { AuthProviderModule } from '@td/auth-provider';
import userAuthKeysConfig from '../../common/user-auth-keys.config';
import { GenerateCsvReportModule } from '@td/generate-csv-report';
import { createContext } from './context';
import {
  appStoreSubscriptionConfig,
  googlePlaySubscriptionConfig,
} from '@td/subscriptions';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CommonCmsModule } from './common/common.cms.module';

const GraphQLProvider = GraphQLModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService) => {
    return {
      debug: configService.get('isDevelopment'),
      playground: configService.get('isDevelopment'),
      include: [
        AdministratorCMSModule,
        ChallengeCMSModule,
        CommonModule,
        CommonCmsModule,
        ConfigCMSModule,
        CountryCMSModule,
        ExerciseCategoryCMSModule,
        ExerciseCMSModule,
        FeedbackCMSModule,
        HmcQuestionCMSModule,
        ProgrammeCMSModule,
        RegionCMSModule,
        TrainerCMSModule,
        UserCMSModule,
        WorkoutCMSModule,
        WorkoutTagsCmsModule,
      ],
      typePaths: [
        './apps/cms/src/**/*.cms.graphql',
        './apps/common/common.graphql',
      ],
      path: '/cms',
      context: createContext,
      formatError,
      resolvers: {
        ...scalars,
      },
    };
  },
});

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    AdministratorCMSModule,
    AuthProviderModule,
    ChallengeCMSModule,
    CommonModule,
    CommonCmsModule,
    ConfigCMSModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        commonConfig,
        databaseConfig,
        userAuthKeysConfig,
        appStoreSubscriptionConfig,
        googlePlaySubscriptionConfig,
      ],
    }),
    CountryCMSModule,
    DatabaseModule,
    ExerciseCategoryCMSModule,
    ExerciseCMSModule,
    FeedbackCMSModule,
    GenerateCsvReportModule,
    GraphQLProvider,
    HmcQuestionCMSModule,
    ProgrammeCMSModule,
    RegionCMSModule,
    TrainerCMSModule,
    UserCMSModule,
    WorkoutCMSModule,
    WorkoutTagsCmsModule,
  ],
})
export class CmsModule {}
