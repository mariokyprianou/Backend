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

  public async uploadObject(
    key: string,
    bucket: string,
    contentType: string,
    body: string,
    region = 'ap-south-1',
    minutes = 60 * 24, // default to one day
  ) {
    const s3 = new S3({ region });
    return s3
      .putObject({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
        ContentDisposition: 'attachment',
        Body: body,
      })
      .promise();
  }

  public env() {
    return envalid.cleanEnv(process.env);
  }
}
