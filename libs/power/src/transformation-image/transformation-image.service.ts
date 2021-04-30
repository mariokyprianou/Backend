import { S3 } from 'aws-sdk';
import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
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
  constructor(
    private commonService: CommonService,
    configService: ConfigService,
  ) {
    const { bucket, region } = configService.get('storage.files');
    this.s3 = new S3({ region });
    this.bucket = bucket;
  }

  public async generateUploadUrl(accountId: string) {
    const id = uuid();
    const imageKey = `transformations/${accountId}/${id}`;
    const url = await this.commonService.getPresignedUrl(
      imageKey,
      this.commonService.env().FILES_BUCKET,
      'putObject',
    );
    // Update the model
    await TransformationImage.query().insert({
      id,
      accountId,
      imageKey,
    });

    return { id, url };
  }

  public async getUserImages(accountId: string) {
    const images = await TransformationImage.query()
      .where('account_id', accountId)
      .orderBy('taken_on', 'DESC')
      .debug();

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

  public async deleteImage(params: {
    accountId: string;
    transformationImageId: string;
  }) {
    try {
      await TransformationImage.query()
        .del()
        .where('id', params.transformationImageId)
        .andWhere('account_id', params.accountId);
      return true;
    } catch (error) {
      return false;
    }
  }

  public async getUploadDetails(
    accountId: string,
    params: UploadProgressImageDto,
  ) {
    const key = `transformations/${accountId}/${format(
      params.takenOn,
      'yyyy-MM-dd',
    )}.${mime.getExtension(params.contentType)}`;

    return {
      uploadUrl: await this.s3.getSignedUrlPromise('putObject', {
        Bucket: this.bucket,
        Key: key,
      }),
    };
  }

  public async onImageUploaded(params: {
    accountId: string;
    imageKey: string;
    date: string;
  }) {
    await TransformationImage.knexQuery()
      .insert({
        account_id: params.accountId,
        image_key: params.imageKey,
        taken_on: params.date,
      })
      .onConflict(['account_id', 'taken_on'])
      .merge();
  }
}
