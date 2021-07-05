import { ObjectionModule } from '@willsoto/nestjs-objection';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Knex from 'knex';
import { BaseModel } from './base.model';
import { UserModel } from './user.model';
import { POWER_DB, USER_DB } from './database.constants';

@Module({
  imports: [
    ObjectionModule.registerAsync({
      name: POWER_DB,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<Knex.Config>('database.config');
        return {
          config,
          Model: BaseModel,
        };
      },
    }),
    ObjectionModule.registerAsync({
      name: USER_DB,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<Knex.Config>('database.userConfig');
        return {
          config,
          Model: UserModel,
        };
      },
    }),
  ],
  exports: [ObjectionModule],
})
export class DatabaseModule {}
