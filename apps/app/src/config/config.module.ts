import { ConfigModule } from '@lib/power/config/config.module';
import { Module } from '@nestjs/common';
import { ConfigResolver } from './config.resolver';

@Module({
  imports: [ConfigModule],
  providers: [ConfigResolver],
})
export class ConfigAppModule {}
