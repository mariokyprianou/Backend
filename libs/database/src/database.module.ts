import { ObjectionModule } from '@willsoto/nestjs-objection';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Knex from 'knex';
import { BaseModel } from './base.model';
import { UserModel } from './user.model';

@Module({
  imports: [
    ObjectionModule.registerAsync({
      name: 'Power',
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
      name: 'User',
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
