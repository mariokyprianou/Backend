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
import { WorkoutCMSModule } from './workout/workout.module';
import { ChallengeCMSModule } from './challenge/challenge.module';

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
        WorkoutCMSModule,
        ChallengeCMSModule,
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
      load: [commonConfig, databaseConfig],
    }),
    CommonModule,
    DatabaseModule,
    ExerciseCMSModule,
    TrainerCMSModule,
    ExerciseCategoryCMSModule,
    ProgrammeCMSModule,
    WorkoutCMSModule,
    ChallengeCMSModule,
    GraphQLProvider,
  ],
})
export class CmsModule {}
