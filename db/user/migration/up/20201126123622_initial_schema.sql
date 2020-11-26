CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE account (
    id uuid CONSTRAINT pk_account PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON account FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
