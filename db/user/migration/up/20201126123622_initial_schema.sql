CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Country
CREATE TABLE country (
  id uuid CONSTRAINT pk_country PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text NOT NULL,
  name text NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON country FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Region
CREATE TABLE region (
  id uuid CONSTRAINT pk_region PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_id uuid NOT NULL,
  region text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_region_country FOREIGN KEY (country_id) REFERENCES country (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON region FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Account
CREATE TABLE account (
  id uuid CONSTRAINT pk_account PRIMARY KEY DEFAULT uuid_generate_v4(),
  cognito_sub uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  country_id uuid NULL,
  region_id uuid NULL,
  time_zone text NOT NULL,
  device_udid text NOT NULL,
  date_of_birth text NULL,
  gender text NULL,
  device_change timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_account_country FOREIGN KEY (country_id) REFERENCES country (id),
  CONSTRAINT fk_account_region FOREIGN KEY (region_id) REFERENCES region (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON account FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
