import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as envalid from 'envalid';

const s3 = new S3();
@Injectable()
export class CommonService {
  public async getPresignedUrl(
    imageKey: string,
    bucket: string,
    operation = 'getObject',
    minutes = 5,
  ): Promise<string> {
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
