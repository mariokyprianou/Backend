import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { UserPowerModule } from '../user-power';
import { UserExportService } from './user-export.service';
import { UserService } from './user.service';

@Module({
  imports: [UserPowerModule],
  providers: [
    UserService,
    {
      provide: UserExportService,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new UserExportService({
          s3Client: new S3({
            region: configService.get('storage.reports.region'),
          }),
          bucketName: configService.get('storage.reports.bucket'),
        });
      },
    },
  ],
  exports: [UserService, UserExportService],
})
export class UserModule {}
