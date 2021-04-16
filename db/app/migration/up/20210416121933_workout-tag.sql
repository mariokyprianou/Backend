CREATE TABLE workout_tag (
  id uuid CONSTRAINT pk_workout_tag PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id uuid NOT NULL,
  taxonomy_term_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_workout_tag_workout FOREIGN KEY (workout_id) REFERENCES workout (id) ON DELETE CASCADE,
  CONSTRAINT fk_workout_tag_tag FOREIGN KEY (taxonomy_term_id) REFERENCES taxonomy_term (id) ON DELETE CASCADE
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON workout_tag FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

INSERT INTO taxonomy (key) values ('workout-tag');
