CREATE TABLE workout_exercise_tr (
  id uuid CONSTRAINT pk_workout_exercise_tr PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_exercise_id uuid NOT NULL,
  language text NOT NULL,
  coaching_tips text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_workout_exercise_tr_exercise_language UNIQUE (workout_exercise_id, language),
  CONSTRAINT fk_workout_exercise_tr_exercise FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercise (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON workout_exercise_tr FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();