/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModel } from '@lib/database';
import { Model, snakeCaseMappers } from 'objection';
import { Onboarding } from './onboarding.model';

export class OnboardingTranslation extends BaseModel {
  static tableName = 'onboarding_screen_tr';

  id: string;
  onboardingScreenId: string;
  language: string;
  title: string;
  description: string;
  imageKey: string;
  createdAt: Date;
  updatedAt: Date;

  onboarding: Onboarding;

  static relationMappings = () => ({
    onboarding: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: Onboarding,
      join: {
        from: 'onboarding_screen_tr.onboarding_screen_id',
        to: 'onboarding_screen.id',
      },
    },
  });
}
