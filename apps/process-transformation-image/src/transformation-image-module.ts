import { commonConfig } from '@lib/common';
import { databaseConfig, DatabaseModule } from '@lib/database';
import { TransformationImageModule } from '@lib/power';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [commonConfig, databaseConfig],
    }),
    DatabaseModule,
    TransformationImageModule,
  ],
})
export class TransformationImageLambdaModule {}
