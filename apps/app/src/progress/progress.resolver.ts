import { ProgressService } from '@lib/power/progress';
import { AuthContext } from '@lib/power/types';
import { Context, Query, Resolver } from '@nestjs/graphql';

@Resolver('ProgressMonth')
export class ProgressResolver {
  constructor(private userProgress: ProgressService) {}
  @Query('progress')
  async query(
    @Context('authContext') authContext: AuthContext,
  ): Promise<ProgressMonth[]> {
    return this.userProgress.getProgress(authContext);
  }
}

export enum ProgressType {
  NEW_WEEK,
  WORKOUT_COMPLETE,
  NEW_PROGRAMME,
}

export interface ProgressDay {
  date: Date;
  type: ProgressType;
}

export interface ProgressMonth {
  startOfMonth: Date;
  days: ProgressDay[];
}
