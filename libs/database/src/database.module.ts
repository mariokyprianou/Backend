import { ObjectionModule } from '@willsoto/nestjs-objection';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Knex from 'knex';
import { BaseModel } from './base.model';

@Module({
  imports: [
    ObjectionModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<Knex.Config>('database');
        return {
          config,
          Model: BaseModel,
        };
      },
    }),
  ],
  exports: [ObjectionModule],
})
export class DatabaseModule {}
