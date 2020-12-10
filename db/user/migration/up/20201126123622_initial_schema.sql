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
  country text NOT NULL,
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

-- Time Zones
CREATE TABLE time_zone (
  id uuid CONSTRAINT pk_time_zone PRIMARY KEY DEFAULT uuid_generate_v4(),
  time_zone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON time_zone FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Account
CREATE TABLE account (
  id uuid CONSTRAINT pk_account PRIMARY KEY DEFAULT uuid_generate_v4(),
  cognito_sub uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  country_id uuid NOT NULL,
  region_id uuid NOT NULL,
  time_zone_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_account_country FOREIGN KEY (country_id) REFERENCES country (id),
  CONSTRAINT fk_account_region FOREIGN KEY (region_id) REFERENCES region (id),
  CONSTRAINT fk_account_time_zone FOREIGN KEY (time_zone_id) REFERENCES time_zone (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON account FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();