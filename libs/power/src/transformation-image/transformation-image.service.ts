import { S3 } from 'aws-sdk';
import { format } from 'date-fns';
import * as jsonwebtoken from 'jsonwebtoken';
import * as uuid from 'uuid';
import * as mime from 'mime';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommonService } from '@lib/common';

import { UploadProgressImageDto } from './dto';
import { TransformationImage } from './transformation-image.model';

@Injectable()
export class TransformationImageService {
  private readonly s3: S3;
  private readonly bucket: string;

  private readonly jwtAudience = 'app.power.api.progress';
  private readonly jwtIssuer: string;
  private readonly jwtSecret: string;

  constructor(
    private commonService: CommonService,
    configService: ConfigService,
  ) {
    const { bucket, region } = configService.get('storage.files');
    this.s3 = new S3({ region });
    this.bucket = bucket;

    this.jwtIssuer = configService.get('jwt.issuer');
    this.jwtSecret = configService.get('jwt.secret');
  }

  public async getUserImages(accountId: string) {
    const images = await TransformationImage.query()
      .where('account_id', accountId)
      .orderBy('taken_on', 'DESC');

    return images.map((image) => this.toDto(image));
  }

  private toDto(image: TransformationImage) {
    return {
      id: image.id,
      takenOn: image.takenOn,
      url: this.s3.getSignedUrlPromise('getObject', {
        Bucket: this.bucket,
        Key: image.imageKey,
      }),
      createdAt: image.createdAt,
    };
  }

  public async getImage(params: {
    accountId: string;
    transformationImageId: string;
    createdAt: Date;
  }) {
    const image = await TransformationImage.query()
      .findById(params.transformationImageId)
      .where('account_id', params.accountId);

    if (!image) {
      return null;
    }

    return this.toDto(image);
  }

  public async getUploadDetails(
    accountId: string,
    params: UploadProgressImageDto,
  ) {
    const payload = {
      sub: accountId,
      key: `incoming/${uuid.v4()}.${mime.getExtension(params.contentType)}`,
      takenOn: format(params.takenOn, 'yyyy-MM-dd'),
      contentType: params.contentType,
    };

    const token = jsonwebtoken.sign(payload, this.jwtSecret, {
      algorithm: 'HS256',
      issuer: this.jwtIssuer,
      audience: this.jwtAudience,
      expiresIn: '15 minutes',
    });

    return {
      token,
      uploadUrl: await this.s3.getSignedUrlPromise('putObject', {
        Bucket: this.bucket,
        Key: payload.key,
      }),
    };
  }

  public async confirmUploadDetails(accountId: string, token: string) {
    const payload: any = jsonwebtoken.verify(token, this.jwtSecret, {
      algorithms: ['HS256'],
      issuer: this.jwtIssuer,
      audience: this.jwtAudience,
    });
    if (payload.sub !== accountId) {
      throw new Error('Invalid user.');
    }

    // Check object exists
    try {
      await this.s3
        .headObject({
          Bucket: this.bucket,
          Key: payload.key,
        })
        .promise();
    } catch (e) {
      if (e.code === 'NotFound') {
        throw new Error('Object does not exist.');
      }
      throw e;
    }

    // Delete existing image/file for this date
    const existingImage = await TransformationImage.query()
      .where('account_id', accountId)
      .andWhere('taken_on', payload.takenOn)
      .first();

    if (existingImage) {
      await this.s3
        .deleteObject({
          Bucket: this.bucket,
          Key: existingImage.imageKey,
        })
        .promise();
      await existingImage.$query().delete();
    }

    // Copy image to new location
    const Key = `transformations/${accountId}/${
      payload.takenOn
    }.${mime.getExtension(payload.contentType)}`;
    await this.s3
      .copyObject({
        CopySource: `${this.bucket}/${payload.key}`,
        Bucket: this.bucket,
        Key: Key,
      })
      .promise();

    const image = await TransformationImage.query()
      .insert({
        accountId: accountId,
        imageKey: Key,
        takenOn: payload.takenOn,
      })
      .returning('*');

    return this.toDto(image);
  }
}
