import { S3 } from 'aws-sdk';
import { format } from 'date-fns';
import { GraphQLError } from 'graphql';
import { v4 as uuid } from 'uuid';
import * as mime from 'mime';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommonService } from '@lib/common';

import { UploadProgressImageDto } from './dto';
import { TransformationImage } from './transformation-image.model';

@Injectable()
export class TransformationImageService {
  constructor(
    private commonService: CommonService,
    private readonly configService: ConfigService,
  ) {}

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
    return TransformationImage.query().where('account_id', accountId);
  }

  public async getImage(params: {
    accountId: string;
    transformationImageId: string;
    createdAt: Date;
  }) {
    const url = await this.commonService.getPresignedUrl(
      `transformations/${params.accountId}/${params.transformationImageId}`,
      this.commonService.env().FILES_BUCKET,
    );

    if (!url) {
      throw new GraphQLError('Could not generate url');
    }
    return {
      url,
      id: params.transformationImageId,
      createdAt: params.createdAt, // ??
    };
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
    const { bucket, region } = this.configService.get('storage.files');
    const s3 = new S3({ region });

    return {
      uploadUrl: await s3.getSignedUrlPromise('putObject', {
        Bucket: bucket,
        Key: `transformations/${accountId}/${format(
          params.date,
          'yyyy-MM-dd',
        )}.${mime.getExtension(params.contentType)}`,
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
