ALTER TABLE user_workout_feedback ADD COLUMN account_id uuid NOT NULL;
ALTER TABLE user_workout_feedback ADD CONSTRAINT fk_user_feedback_account FOREIGN KEY (account_id) REFERENCES account (id);