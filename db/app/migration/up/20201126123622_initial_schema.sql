
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TYPE config_type AS ENUM (
  'TERMS',
  'PRIVACY',
  'THREE_DAYS_WITHOUT_TRAINING',
  'TWO_WEEKS_WITHOUT_OPENING_APP',
  'SEVEN_DAYS_WITHOUT_LOGGING_CHALLENGE',
  'NEW_TRAINER_ADDED',
  'NEW_CHALLENGE_ADDED',
  'END_OF_COMPLETED_WORKOUT_WEEK'
);


CREATE TABLE config (
  id uuid CONSTRAINT pk_config PRIMARY KEY DEFAULT uuid_generate_v4(),
  type config_type not null,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_config_key UNIQUE (key)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON config FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE config_tr (
  id uuid CONSTRAINT pk_config_tr PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id uuid NOT NULL,
  language text NOT NULL,
  title text NOT NULL,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_config_tr_config_language UNIQUE (config_id, language),
  CONSTRAINT fk_config_tr_config FOREIGN KEY (config_id) REFERENCES config (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON config_tr FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE onboarding_screen (
  id uuid CONSTRAINT pk_onboarding_screen PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON onboarding_screen FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE onboarding_screen_tr (
  id uuid CONSTRAINT pk_onboarding_screen_tr PRIMARY KEY DEFAULT uuid_generate_v4(),
  onboarding_screen_id uuid NOT NULL,
  language text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  image_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_onboarding_screen_tr_screen_language UNIQUE (onboarding_screen_id, language),
  CONSTRAINT fk_onboarding_screen_screen FOREIGN KEY (onboarding_screen_id) REFERENCES onboarding_screen (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON onboarding_screen_tr FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE trainer (
  id uuid CONSTRAINT pk_trainer_ PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON trainer FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE trainer_tr (
  id uuid CONSTRAINT pk_trainer_tr PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id uuid NOT NULL,
  language text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_trainer_tr_trainer_language UNIQUE (trainer_id, language),
  CONSTRAINT fk_trainer_tr_trainer FOREIGN KEY (trainer_id) REFERENCES trainer (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON trainer_tr FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TYPE publish_status_enum AS ENUM ('PUBLISHED', 'DRAFT');

CREATE TYPE training_programme_environment AS ENUM ('HOME', 'GYM');
CREATE TABLE training_programme (
  id uuid CONSTRAINT pk_training_programme PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id uuid NOT NULL,
  environment training_programme_environment NOT NULL,
  fitness INTEGER NOT NULL CHECK (fitness >= 0 AND fitness <= 100),
  muscle INTEGER NOT NULL CHECK (muscle >= 0 AND muscle <= 100),
  fat_loss INTEGER NOT NULL CHECK (fat_loss >= 0 AND fat_loss <= 100),
  status publish_status_enum NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
	deleted_at timestamptz,
  CONSTRAINT fk_training_programme_trainer FOREIGN KEY (trainer_id) REFERENCES trainer (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON training_programme FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE training_programme_tr (
  id uuid CONSTRAINT pk_training_programme_tr PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_programme_id uuid NOT NULL,
  language text NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_training_programme_tr_training_programme_language UNIQUE (training_programme_id, language),
  CONSTRAINT fk_training_programme_tr_training_programme FOREIGN KEY (training_programme_id) REFERENCES training_programme (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON training_programme_tr FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE training_programme_image (
  id uuid CONSTRAINT pk_training_programme_image PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_programme_id uuid NOT NULL,
  order_index int not null default 0,
  image_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_training_programme_image_training_programme FOREIGN KEY (training_programme_id) REFERENCES training_programme (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON training_programme_image FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TYPE intesity_enum AS ENUM ('LOW', 'MOD', 'HIGH');
CREATE TABLE workout (
  id uuid CONSTRAINT pk_workout PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_programme_id uuid NOT NULL,
  overview_image_key text NULL,
  intensity intesity_enum NOT NULL,
  duration int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_workout_training_programme FOREIGN KEY (training_programme_id) REFERENCES training_programme (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON workout FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE workout_tr (
  id uuid CONSTRAINT pk_workout_tr PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id uuid NOT NULL,
  language text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_workout_tr_workout_language UNIQUE (workout_id, language),
  CONSTRAINT fk_workout_tr_workout FOREIGN KEY (workout_id) REFERENCES workout (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON workout_tr FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE training_programme_workout (
  id uuid CONSTRAINT pk_training_programme_workout PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_programme_id uuid NOT NULL,
  week_number integer NOT NULL,
  order_index integer NOT NULL,
  workout_id uuid NOT NULL,
  CONSTRAINT uq_training_programme_workout_workout UNIQUE (workout_id),
  CONSTRAINT uq_training_programme_workout_week_order UNIQUE (training_programme_id, week_number, order_index),
  CONSTRAINT fk_training_programme_workout_training_programme FOREIGN KEY (training_programme_id) REFERENCES training_programme (id),
  CONSTRAINT fk_training_programme_workout_workout FOREIGN KEY (workout_id) REFERENCES workout (id)
);

CREATE TABLE exercise_category (
  id uuid CONSTRAINT pk_exercise_category PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON exercise_category FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();


CREATE TABLE exercise (
  id uuid CONSTRAINT pk_exercise PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id uuid NOT NULL,
  weight boolean NOT NULL,
  video_key text NOT NULL,
  video_key_easy text NULL,
  video_key_easiest text NULL,
  delete boolean DEFAULT FALSE,
  category_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_exercise_trainer FOREIGN KEY (trainer_id) REFERENCES trainer (id),
  CONSTRAINT fk_exercise_category FOREIGN KEY (category_id) REFERENCES exercise_category (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON exercise FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE exercise_tr (
  id uuid CONSTRAINT pk_exercise_tr PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id uuid NOT NULL,
  language text NOT NULL,
  name text NOT NULL,
  coaching_tips text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_exercise_tr_exercise_language UNIQUE (exercise_id, language),
  CONSTRAINT fk_exercise_tr_exercise FOREIGN KEY (exercise_id) REFERENCES exercise (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON exercise_tr FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TYPE set_type_enum AS ENUM ('REPS', 'TIME');
CREATE TABLE workout_exercise (
  id uuid CONSTRAINT pk_workout_exercise PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  set_type set_type_enum NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_workout_exercise_tr_workout FOREIGN KEY (workout_id) REFERENCES workout (id),
  CONSTRAINT fk_workout_exercise_tr_exercise FOREIGN KEY (exercise_id) REFERENCES exercise (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON workout_exercise FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE workout_exercise_set (
  id uuid CONSTRAINT pk_workout_exercise_set PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_exercise_id uuid NOT NULL,
  set_number integer not null CHECK (set_number >= 0 AND set_number <= 4),
  quantity integer not null CHECK (quantity >= 0),
  rest_time integer DEFAULT NULL CHECK (quantity >= 0),
  CONSTRAINT fk_workout_exercise_set_exercise FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercise (id),
  CONSTRAINT uq_workout_exercise_set_exercise_set_number UNIQUE (workout_exercise_id, set_number)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON workout_exercise_set FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE hmc_question (
  id uuid CONSTRAINT pk_hmc_question PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON hmc_question FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE hmc_question_score (
  id uuid CONSTRAINT pk_hmc_question_score PRIMARY KEY DEFAULT uuid_generate_v4(),
  hmc_question_id uuid NOT NULL,
  training_programme_id uuid NOT NULL,
  answer_1_score INTEGER NOT NULL CHECK (answer_1_score >= 0 AND answer_1_score <= 100),
  answer_2_score INTEGER NOT NULL CHECK (answer_2_score >= 0 AND answer_2_score <= 100),
  answer_3_score INTEGER NOT NULL CHECK (answer_3_score >= 0 AND answer_3_score <= 100),
  answer_4_score INTEGER NOT NULL CHECK (answer_4_score >= 0 AND answer_4_score <= 100),
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON hmc_question_score FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE hmc_question_tr (
  id uuid CONSTRAINT pk_hmc_question_tr PRIMARY KEY DEFAULT uuid_generate_v4(),
  hmc_question_id uuid NOT NULL,
  language text NOT NULL,
  question text NOT NULL,
  answer_1 text NOT NULL,
  answer_2 text NOT NULL,
  answer_3 text NOT NULL,
  answer_4 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_hmc_question_tr_question FOREIGN KEY (hmc_question_id) REFERENCES hmc_question (id),
  CONSTRAINT uq_hmc_question_tr_question_language UNIQUE (hmc_question_id, language)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON hmc_question_tr FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();


-- Challenges

CREATE TYPE challenge_type_enum AS enum ('COUNTDOWN', 'STOPWATCH', 'OTHER');

CREATE TABLE challenge (
  id uuid CONSTRAINT pk_challenge PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_programme_id uuid NOT NULL,
  type challenge_type_enum NOT NULL,
  duration INTEGER DEFAULT NULL CHECK (duration IS NULL OR (duration IS NOT NULL AND type = 'COUNTDOWN')),
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  deleted_at timestamptz DEFAULT NULL,
  CONSTRAINT fk_challenge_training_programme FOREIGN KEY (training_programme_id) REFERENCES training_programme (id),
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON challenge FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE challenge_tr (
  id uuid CONSTRAINT pk_challenge_tr PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id uuid NOT NULL,
  language text NOT NULL,
  name text NOT NULL,
  field_title text NOT NULL,
  field_description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_challenge_tr_challenge FOREIGN KEY (challenge_id) REFERENCES challenge (id),
  CONSTRAINT uq_challenge_tr_challenge_language UNIQUE (challenge_id, language)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON challenge_tr FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Programme - share media

CREATE TABLE share_media_image (
  id uuid CONSTRAINT pk_share_media_image PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_programme_id uuid NOT NULL,
  type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_share_media_image FOREIGN KEY (training_programme_id) REFERENCES training_programme (id),
  CONSTRAINT uq_share_media_image_programme_type UNIQUE (training_programme_id, type)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON share_media_image FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE share_media_image_tr (
  id uuid CONSTRAINT pk_share_media_image_tr PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_media_image_id uuid NOT NULL,
  language text NOT NULL,
  image_key text NOT NULL,
  colour text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_share_media_image_smi FOREIGN KEY (share_media_image_id) REFERENCES share_media_image (id),
  CONSTRAINT uq_share_media_image_smi_language UNIQUE (share_media_image_id, language)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON share_media_image_tr FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- User accounts

CREATE TABLE account (
  id uuid CONSTRAINT pk_account PRIMARY KEY DEFAULT uuid_generate_v4(),
  cognito_username text NOT NULL,
  user_training_programme_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_account_cognito_username UNIQUE (cognito_username),
  CONSTRAINT fk_account_user_training_programme FOREIGN KEY (user_training_programme_id) REFERENCES user_training_programme (id) DEFERRABLE,
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON account FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
--

CREATE TABLE user_training_programme (
  id uuid CONSTRAINT pk_user_training_programme PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id uuid NOT NULL,
  training_programme_id uuid NOT NULL,
  start_date timestamptz NOT NULL DEFAULT NOW(),
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON user_training_programme FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE user_category_history (
  id uuid CONSTRAINT pk_user_category_history PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id uuid NOT NULL,
  exercise_category_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON user_category_history FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();


CREATE TABLE user_category_history_set (
  id uuid CONSTRAINT pk_user_category_history_set PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_category_history_id uuid NOT NULL,
  set_number INT NOT NULL,
  amount DECIMAL NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON user_category_history_set FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE user_exercise_note (
  id uuid CONSTRAINT pk_user_exercise_note PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_user_exercise_note_account FOREIGN KEY (account_id) REFERENCES account (id),
  CONSTRAINT fk_user_exercise_note_exercise FOREIGN KEY (exercise_id) REFERENCES exercise (id),
  CONSTRAINT uq_user_exercise_note_account_exercise UNIQUE (account_id, exercise_id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON user_exercise_note FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE user_workout_week (
  id uuid CONSTRAINT pk_user_workout_week PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_training_programme_id uuid NOT NULL,
  week_number integer NOT NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_user_training_programme FOREIGN KEY (user_training_programme_id) REFERENCES user_training_programme (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON user_workout_week FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE user_workout_feedback_emoji (
  id uuid CONSTRAINT pk_user_workout PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_workout_id uuid NOT NULL,
  emoji text NOT NULL,
  CONSTRAINT fk_user_workout FOREIGN KEY (user_workout_id) REFERENCES user_workout (id)
);

CREATE TABLE user_workout (
  id uuid CONSTRAINT pk_user_workout PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_workout_week_id uuid NOT NULL,
  order_index integer NOT NULL,
  workout_id uuid NOT NULL,
  feedback_intensity integer NULL,
  time_taken integer,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_user_workout_week FOREIGN KEY (user_workout_week_id) REFERENCES user_workout_week (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON user_workout FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE transformation_image (
  id uuid CONSTRAINT pk_transformation_image PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id uuid NOT NULL,
  image_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_transformation_image FOREIGN KEY (account_id) REFERENCES account (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON transformation_image FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE challenge_history (
  id uuid CONSTRAINT pk_challenge_history PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id uuid NOT NULL,
  challenge_id uuid NOT NULL,
  quantity text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_challenge_history_account FOREIGN KEY (account_id) REFERENCES account (id),
  CONSTRAINT fk_challenge_history_challenge FOREIGN KEY (challenge_id) REFERENCES challenge (id)
);
CREATE TRIGGER set_timestamp BEFORE UPDATE ON challenge_history FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
