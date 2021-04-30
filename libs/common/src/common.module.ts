import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudfrontConfig, CloudfrontObjectStore, S3ObjectStore } from './cdn';
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
  ],
  exports: [CommonService, VIDEO_CDN],
})
export class CommonModule {}
