ALTER TABLE user_workout DROP COLUMN feedback_intensity;
ALTER TABLE user_workout DROP COLUMN time_taken;

DROP TABLE user_workout_feedback_emoji;

CREATE TABLE user_workout_feedback (
  id uuid CONSTRAINT pk_user_workout_feedback_emoji PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_workout_id uuid NOT NULL,
  emoji text NULL,
  feedback_intensity integer NOT NULL,
  time_taken integer NOT NULL,
  CONSTRAINT fk_user_workout FOREIGN KEY (user_workout_id) REFERENCES user_workout (id)
);