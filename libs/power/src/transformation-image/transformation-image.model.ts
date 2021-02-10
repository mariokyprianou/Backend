/*
 * Author: Joseph Clough (joseph.clough@thedistance.co.uk)
 * Created: Wed, 10th February 212021
 * Copyright 2021 - The Distance
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';

export class TransformationImage extends BaseModel {
  static tableName = 'transformation_image';

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  id: string;
  accountId: string;
  imageKey: string;
  createdAt: Date;
  updatedAt: Date;
}
