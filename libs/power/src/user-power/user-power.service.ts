import { Injectable } from '@nestjs/common';
import { Account, AccountService } from '../account';
import { UserProgrammeService } from '../user-programme';
import * as R from 'ramda';
import { Programme } from '../programme';
import { CommonService } from '@lib/common';
import { UserWorkoutService } from '../user-workout';
import { UserWorkoutWeekService } from '../user-workout-week';

@Injectable()
export class UserPowerService {
  constructor(
    private accountService: AccountService, // private userProgramme: UserProgrammeService,
    // private commonService: CommonService,
    private userWorkoutService: UserWorkoutService,
    private userWorkoutWeekService: UserWorkoutWeekService,
  ) {}

  public async currentUserProgramme(sub: string, language: string) {
    // Fetch Account
    // Fetch Programme On Account
    // Fetch the mapped training programme
    const account = await this.accountService
      .findBySub(sub)
      .withGraphJoined(
        '[trainingProgramme.[trainingProgramme.[localisations, images, trainer.[localisations], shareMediaImages]]]',
        {
          minimize: true,
          joinOperation: 'leftJoin',
        },
      );

    console.log(JSON.stringify(account));

    // return userProgramme
    return this.buildUserProgramme(account, language);
  }

  private async buildUserProgramme(account: Account, language: string) {
    const originalProgramme: Programme = R.path(
      ['trainingProgramme', 'trainingProgramme'],
      account,
    );

    if (!originalProgramme) {
      throw new Error('No training programme found.');
    }

    // find the current week
    // completed_at null (lowest week number)
    const currentWeek = await this.userWorkoutWeekService
      .findAll(0, 25, 'user_workout_week.created_at')
      .whereNull('user_workout_week.completed_at')
      .min('week_number')
      .groupBy(
        'user_workout_week.id',
        'workouts:workout.id',
        'workouts.id',
        'workouts:emojis.id',
      )
      .withGraphJoined('[workouts.[workout, emojis]]');

    console.log(JSON.stringify(currentWeek));

    return {
      id: account.userTrainingProgrammeId,
      trainer: {
        ...originalProgramme.trainer,
        ...(originalProgramme.trainer.localisations ?? []).find(
          (tr) => tr.language === language,
        ),
      },
      environment: originalProgramme.environment,
      fatLoss: originalProgramme.fatLoss,
      fitness: originalProgramme.fitness,
      muscle: originalProgramme.muscle,
      description: originalProgramme.getTranslation(language).description,
      //   programmeImage TODO
    };
  }
}
