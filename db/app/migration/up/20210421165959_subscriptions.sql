CREATE TABLE subscription (
  id uuid CONSTRAINT pk_subscription PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id uuid NOT NULL,
  transaction_id text NOT NULL,
  sku text NOT NULL,
  expires_at timestamptz NOT NULL,
  last_verified_at timestamptz NOT NULL,
  provider text NOT NULL,
  provider_token text NOT NULL,
  provider_response jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_subscription_account FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE,
  CONSTRAINT uq_subscription_transaction_id UNIQUE (transaction_id)
);

CREATE TRIGGER set_timestamp BEFORE UPDATE ON subscription FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();