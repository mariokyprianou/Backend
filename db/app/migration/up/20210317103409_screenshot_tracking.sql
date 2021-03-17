CREATE TABLE screenshot (
  id uuid CONSTRAINT pk_screenshot PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id uuid NOT NULL,
  taken_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_screenshot_account FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE
);
CREATE INDEX ix_screenshot_account_taken_at ON screenshot (account_id, taken_at);