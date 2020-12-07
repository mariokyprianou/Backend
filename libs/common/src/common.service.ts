import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as envalid from 'envalid';
@Injectable()
export class CommonService {
  public async getPresignedUrl(
    imageKey: string,
    bucket: string,
    operation = 'getObject',
    region = 'ap-south-1',
    minutes = 5,
  ): Promise<string> {
    const s3 = new S3({ region });
    return s3.getSignedUrlPromise(operation, {
      Bucket: bucket,
      Key: imageKey,
      Expires: 60 * minutes,
    });
  }

  public env() {
    return envalid.cleanEnv(process.env);
  }
}
