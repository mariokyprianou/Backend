/*
 * Author: Joseph Clough (joseph.clough@thedistance.co.uk)
 * Created: Wed, 10th February 212021
 * Copyright 2021 - The Distance
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';

export class TransformationImage extends BaseModel {
  static tableName = 'transformation_image';

  id: string;
  accountId: string;
  imageKey: string;
  takenOn: Date;
  createdAt: Date;
  updatedAt: Date;
}
