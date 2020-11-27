/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';

export class OnboardingTranslation extends BaseModel {
  static tableName = 'onboarding_screen_tr';

//   static get columnNameMappers() {
//     return snakeCaseMappers();
//   }

  id: string;
  onboardingScreenId: string;
  language: string;
  title: string;
  description: string;
  imageKey: string;
  createdAt: Date;
  updatedAt: Date;
}
