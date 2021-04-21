CREATE TYPE workout_type AS ENUM (
  'SCHEDULED',
  'ON_DEMAND'
);

alter table user_workout
  alter column user_workout_week_id drop not null,
  add column type workout_type DEFAULT 'SCHEDULED',
  add column account_id uuid default null,
  add check (type != 'SCHEDULED' OR (user_workout_week_id is not null)),
  add check (type != 'ON_DEMAND' OR (user_workout_week_id is null));

with accounts as (
  select user_workout.id as user_workout_id, user_training_programme.account_id
  from user_workout
      join user_workout_week on user_workout.user_workout_week_id = user_workout_week.id
      join user_training_programme on user_workout_week.user_training_programme_id = user_training_programme.id
)
update user_workout
    set account_id = accounts.account_id
    from accounts
    where accounts.user_workout_id = user_workout.id;

alter table user_workout
  alter column type DROP DEFAULT,
  alter column account_id set not null,
  add constraint fk_user_workout_account foreign key (account_id) references account (id) on delete cascade;

delete from user_workout_week where started_at is null;
alter table user_workout_week drop started_at;

