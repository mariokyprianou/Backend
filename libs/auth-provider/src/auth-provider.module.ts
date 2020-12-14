import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthProviderService } from './auth-provider.service';

@Module({
  imports: [ConfigModule],
  providers: [AuthProviderService],
  exports: [AuthProviderService],
})
export class AuthProviderModule {}
