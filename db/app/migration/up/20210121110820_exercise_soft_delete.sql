ALTER TABLE exercise DROP COLUMN delete;
ALTER TABLE exercise ADD COLUMN deleted_at timestamptz null;