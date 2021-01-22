CREATE TABLE user_workout_feedback (
  id uuid CONSTRAINT pk_user_workout_feedback PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_workout_id uuid NOT NULL,
  emoji text NULL,
  feedback_intensity integer NOT NULL,
  time_taken integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp BEFORE UPDATE ON user_workout_feedback FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();