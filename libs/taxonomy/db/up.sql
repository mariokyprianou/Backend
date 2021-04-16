
CREATE TABLE taxonomy (
  id uuid NOT NULL CONSTRAINT pk_taxonomy PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_taxonomy_key UNIQUE (key)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON taxonomy FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE taxonomy_tr (
  id uuid NOT NULL CONSTRAINT pk_taxonomy_tr PRIMARY KEY DEFAULT uuid_generate_v4(),
  taxonomy_id uuid NOT NULL,
  language text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_taxonomy_tr_taxonomy_language UNIQUE (taxonomy_id, language),
  CONSTRAINT fk_taxonomy_tr_taxonomy FOREIGN KEY (taxonomy_id) REFERENCES taxonomy (id) ON DELETE CASCADE
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON taxonomy_tr FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE taxonomy_term (
  id uuid NOT NULL CONSTRAINT pk_taxonomy_term PRIMARY KEY DEFAULT uuid_generate_v4(),
  taxonomy_id uuid NOT NULL,
  key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_taxonomy_term_key UNIQUE (taxonomy_id, key),
  CONSTRAINT fk_taxonomy_term_taxonomy FOREIGN KEY (taxonomy_id) REFERENCES taxonomy (id) ON DELETE CASCADE
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON taxonomy_term FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE taxonomy_term_tr (
  id uuid NOT NULL CONSTRAINT pk_taxonomy_term_tr PRIMARY KEY DEFAULT uuid_generate_v4(),
  taxonomy_term_id uuid NOT NULL,
  language text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_taxonomy_term_tr_taxonomy_term_language UNIQUE (taxonomy_term_id, language),
  CONSTRAINT fk_taxonomy_term_tr_taxonomy_term FOREIGN KEY (taxonomy_term_id) REFERENCES taxonomy_term (id) ON DELETE CASCADE
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON taxonomy_term_tr FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();