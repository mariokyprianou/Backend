ALTER TABLE user_workout_week DROP CONSTRAINT fk_user_training_programme;
ALTER TABLE user_workout_week ADD CONSTRAINT fk_user_training_programme FOREIGN KEY (user_training_programme_id) REFERENCES user_training_programme (id) ON DELETE CASCADE;

ALTER TABLE user_workout DROP CONSTRAINT fk_user_workout_week;
ALTER TABLE user_workout ADD CONSTRAINT fk_user_workout_week FOREIGN KEY (user_workout_week_id) REFERENCES user_workout_week (id) ON DELETE CASCADE;
