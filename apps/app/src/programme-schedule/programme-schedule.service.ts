import { POWER_DB } from '@lib/database';
import { Inject, Injectable } from '@nestjs/common';
import Knex from 'knex';
import {
  ProgrammeSchedule,
  ProgrammeWeekSummary,
} from './programme-schedule.interface';

const SCHEDULE_QUERY = `with programme_weeks as (
  select
    tpw.week_number,
    tpw.order_index as workout_order_index,
		tpw.workout_id as workout_id
  from account as acc
    join user_training_programme as utp on acc.user_training_programme_id = utp.id
    join training_programme_workout tpw on utp.training_programme_id = tpw.training_programme_id
	where account_id = :accountId
),
user_weeks as (
  select
    uww.week_number,
    uww.created_at as week_started_at,
		uw.order_index as workout_order_index,
    uw.workout_id as workout_id,
		uw.completed_at as workout_completed_at
  from account as acc
    join user_training_programme as utp on acc.user_training_programme_id = utp.id
    join user_workout_week uww on utp.id = uww.user_training_programme_id
    join user_workout uw on uww.id = uw.user_workout_week_id
  where acc.id = :accountId and uww.created_at >= (
    select MAX(user_workout_week.created_at)
    from account
      join user_workout_week on account.user_training_programme_id = user_workout_week.user_training_programme_id
    where account.id = :accountId and user_workout_week.week_number = 1
  )
)
select
	coalesce(user_weeks.week_number, programme_weeks.week_number)                 as week_number,
  coalesce(user_weeks.workout_order_index, programme_weeks.workout_order_index) as workout_order_index,
	coalesce(wt.name, wt_fallback.name)                                           as workout_name,
  w.duration                                                                    as workout_duration,
	user_weeks.week_started_at                                                    as week_started_at,
	user_weeks.workout_completed_at                                               as workout_completed_at
from programme_weeks
  full join user_weeks on (
    programme_weeks.week_number = user_weeks.week_number and
    programme_weeks.workout_order_index = user_weeks.workout_order_index
  )
  join workout w on coalesce(user_weeks.workout_id, programme_weeks.workout_id) = w.id
    left join workout_tr wt on (w.id = wt.workout_id and wt.language = :language)
    left join workout_tr wt_fallback on (w.id = wt_fallback.workout_id and wt_fallback.language = 'en')
order by
    coalesce(user_weeks.week_number, programme_weeks.week_number),
    coalesce(user_weeks.workout_order_index, programme_weeks.workout_order_index)`;

interface ScheduleRow {
  week_number: number;
  workout_order_index: number;
  workout_name: string;
  workout_duration: number;
  week_started_at?: Date;
  workout_completed_at?: Date;
}

@Injectable()
export class ProgrammeScheduleService {
  constructor(@Inject(POWER_DB) private readonly db: Knex) {}

  async findProgrammeSchedule(
    accountId: string,
    language: string,
  ): Promise<ProgrammeSchedule> {
    const results = await this.db.raw(SCHEDULE_QUERY, {
      accountId,
      language,
    });
    const { rows } = results;

    // console.log(JSON.stringify(rows, null, 2));

    const weeks = [];
    let currentWeek: ProgrammeWeekSummary = null;
    for (const row of rows) {
      if (!currentWeek || currentWeek.weekNumber !== row.week_number) {
        currentWeek = {
          weekNumber: row.week_number,
          startedAt: row.week_started_at,
          workouts: [],
        };
        weeks.push(currentWeek);
      }
      currentWeek.workouts.push({
        name: row.workout_name,
        orderIndex: row.workout_order_index,
        duration: row.workout_duration,
        completedAt: row.workout_completed_at,
      });
    }

    return { weeks };
  }
}
