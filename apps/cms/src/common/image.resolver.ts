import { S3 } from 'aws-sdk';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';

@Resolver('Image')
export class ImageResolver {
  private readonly s3: S3;
  private readonly bucket: string;

  constructor(configService: ConfigService) {
    this.s3 = new S3({ region: configService.get('storage.files.region') });
    this.bucket = configService.get('storage.files.bucket');
  }

  @ResolveField('key')
  getKey(@Parent() key: string) {
    return key;
  }

  @ResolveField('url')
  getUrl(@Parent() key: string) {
    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.bucket,
      Key: key,
      Expires: 60 * 60,
    });
  }
}
