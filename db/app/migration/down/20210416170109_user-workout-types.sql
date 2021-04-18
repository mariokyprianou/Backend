delete from user_workout where type = 'ON_DEMAND';
alter table user_workout
  drop column type,
  drop column account_id,
  alter column user_workout_week_id set not null;
  
drop type workout_type;
