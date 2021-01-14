import { commonConfig } from '@lib/common';
import { databaseConfig, DatabaseModule } from '@lib/database';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { CommonModule } from '../../common/common.module';
import { TrainerCMSModule } from './trainer/trainer.module';
import scalars from '../../common/scalars';
import { ExerciseCMSModule } from './exercise/exercise.module';
import { ExerciseCategoryCMSModule } from './exercise-category/exercise-category.module';
import { ProgrammeCMSModule } from './programme/programme.module';
import { HmcQuestionCMSModule } from './hmc-question/hmc-question.cms.module';
import { WorkoutCMSModule } from './workout/workout.module';
import { FeedbackCMSModule } from './feedback/feedback.module';
import { ConfigCMSModule } from './config/config.module';
import { ChallengeCMSModule } from './challenge/challenge.module';
import { UserCMSModule } from './user/user.module';
import { AdministratorCMSModule } from './administrator/administrator.module';
import { TimeZoneCMSModule } from './timeZone/timeZone.module';
import { RegionCMSModule } from './region/region.module';
import { CountryCMSModule } from './country/region.module';
import { AuthProviderModule } from '@td/auth-provider';
import userAuthKeysConfig from '../../common/user-auth-keys.config';
import { GenerateCsvReportModule } from '@td/generate-csv-report';

const GraphQLProvider = GraphQLModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService) => {
    return {
      debug: configService.get('isDevelopment'),
      playground: configService.get('isDevelopment'),
      include: [
        CommonModule,
        TrainerCMSModule,
        ExerciseCMSModule,
        ExerciseCategoryCMSModule,
        ProgrammeCMSModule,
        HmcQuestionCMSModule,
        WorkoutCMSModule,
        FeedbackCMSModule,
        ConfigCMSModule,
        ChallengeCMSModule,
        UserCMSModule,
        AdministratorCMSModule,
        TimeZoneCMSModule,
        RegionCMSModule,
        CountryCMSModule,
      ],
      typePaths: [
        './apps/cms/src/**/*.cms.graphql',
        './apps/common/common.graphql',
      ],
      path: '/cms',
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
      load: [commonConfig, databaseConfig, userAuthKeysConfig],
    }),
    CommonModule,
    DatabaseModule,
    ExerciseCMSModule,
    TrainerCMSModule,
    ExerciseCategoryCMSModule,
    ProgrammeCMSModule,
    HmcQuestionCMSModule,
    WorkoutCMSModule,
    FeedbackCMSModule,
    ConfigCMSModule,
    ChallengeCMSModule,
    UserCMSModule,
    AdministratorCMSModule,
    TimeZoneCMSModule,
    RegionCMSModule,
    CountryCMSModule,
    AuthProviderModule,
    GenerateCsvReportModule,
    GraphQLProvider,
  ],
})
export class CmsModule {}
