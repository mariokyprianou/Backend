import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CloudfrontConfig,
  CloudfrontObjectStore,
  ImageHandlerObjectStore,
  S3ObjectStore,
} from './cdn';
import { IMAGE_CDN } from './common.constants';
import { CommonService } from './common.service';
import { Lazy } from './lazy';
import { getSSMConfig } from './ssm';

const VIDEO_CDN = 'VIDEO_CDN';
@Module({
  providers: [
    CommonService,
    {
      provide: VIDEO_CDN,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get('storage.videos');
        if (config.cdn === 'cloudfront') {
          const config = new Lazy<CloudfrontConfig>(async () => {
            const { cloudfront } = await getSSMConfig(process.env.STAGE);
            return cloudfront;
          });
          return new CloudfrontObjectStore(config);
        } else {
          return new S3ObjectStore({
            bucket: config.bucket,
            region: config.region,
          });
        }
      },
    },
    {
      provide: IMAGE_CDN,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get('storage.files');
        return new ImageHandlerObjectStore({
          bucket: config.bucket,
          distributionName: config.distributionName,
        });
      },
    },
  ],
  exports: [CommonService, IMAGE_CDN, VIDEO_CDN],
})
export class CommonModule {}
