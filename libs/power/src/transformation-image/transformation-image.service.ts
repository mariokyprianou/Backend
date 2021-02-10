/*
 * Author: Joseph Clough (joseph.clough@thedistance.co.uk)
 * Created: Wed, 10th February 212021
 * Copyright 2021 - The Distance
 */

import { Injectable } from '@nestjs/common';
import { AuthContext } from '../types';
import { v4 as uuid } from 'uuid';
import { AccountService } from '../account';
import { CommonService } from '@lib/common';
import { TransformationImage } from './transformation-image.model';
import { GraphQLError } from 'graphql';

@Injectable()
export class TransformationImageService {
  constructor(private account: AccountService, private common: CommonService) {}

  public async generateUploadUrl(authContext: AuthContext) {
    const account = await this.account.findBySub(authContext.sub);
    const id = uuid();
    const imageKey = `transformations/${account.id}/${id}`;
    const url = await this.common.getPresignedUrl(
      imageKey,
      this.common.env().FILES_BUCKET,
      'putObject',
    );
    // Update the model
    await TransformationImage.query().insertAndFetch({
      id,
      accountId: account.id,
      imageKey,
    });

    return { id, url };
  }

  public async allImages(authContext: AuthContext) {
    const account = await this.account.findBySub(authContext.sub);
    const tImages = await TransformationImage.query().where(
      'account_id',
      account.id,
    );

    return tImages;
  }

  public async getImage(id: string, createdAt: Date, authContext: AuthContext) {
    const account = await this.account.findBySub(authContext.sub);
    const url = await this.common.getPresignedUrl(
      `transformations/${account.id}/${id}`,
      this.common.env().FILES_BUCKET,
    );

    if (!url) {
      throw new GraphQLError('Could not generate url');
    }
    return {
      url,
      id,
      createdAt,
    };
  }

  public async deleteImage(id: string, authContext: AuthContext) {
    try {
      const account = await this.account.findBySub(authContext.sub);
      await TransformationImage.query()
        .del()
        .where('id', id)
        .andWhere('account_id', account.id);
      return true;
    } catch (error) {
      return false;
    }
  }
}
