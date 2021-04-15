CREATE TABLE on_demand_workout (
  id uuid CONSTRAINT pk_on_demand_workout PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_on_demand_workout_workout UNIQUE (workout_id),
  CONSTRAINT fk_on_demand_workout_workout FOREIGN KEY (workout_id) REFERENCES workout (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON on_demand_workout FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
 