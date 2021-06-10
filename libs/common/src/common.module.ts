import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CloudfrontConfig,
  CloudfrontObjectStore,
  CloudfrontSigner,
  ImageHandlerObjectStore,
} from './cdn';
import {
  CLOUDFRONT_CONFIG,
  CLOUDFRONT_SIGNER,
  IMAGE_CDN,
  VIDEO_CDN,
} from './common.constants';
import { CommonService } from './common.service';
import { Lazy } from './lazy';
import { getSSMConfig } from './ssm';

@Module({
  providers: [
    CommonService,
    {
      provide: CLOUDFRONT_CONFIG,
      useFactory: () => {
        return new Lazy<CloudfrontConfig>(async () => {
          const { cloudfront } = await getSSMConfig(process.env.STAGE);
          return cloudfront;
        });
      },
    },
    {
      provide: CLOUDFRONT_SIGNER,
      inject: [CLOUDFRONT_CONFIG],
      useFactory: (config: CloudfrontConfig) => {
        return new CloudfrontSigner(config);
      },
    },
    {
      provide: VIDEO_CDN,
      inject: [ConfigService, CLOUDFRONT_SIGNER],
      useFactory: (
        configService: ConfigService,
        cfSigner: CloudfrontSigner,
      ) => {
        const { distributionUrl } = configService.get('storage.videos');
        return new CloudfrontObjectStore(distributionUrl, cfSigner);
      },
    },
    {
      provide: IMAGE_CDN,
      inject: [ConfigService, CLOUDFRONT_SIGNER],
      useFactory: (configService: ConfigService, signer: CloudfrontSigner) => {
        const { bucket, distributionUrl } = configService.get('storage.files');
        return new ImageHandlerObjectStore({
          bucket: bucket,
          distributionUrl: distributionUrl,
          signer,
        });
      },
    },
  ],
  exports: [CommonService, IMAGE_CDN, VIDEO_CDN],
})
export class CommonModule {}
