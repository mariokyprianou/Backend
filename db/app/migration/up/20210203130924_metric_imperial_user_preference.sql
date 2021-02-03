CREATE TYPE weight_preference_enum AS ENUM (
    'KG',
    'LB'
);

ALTER TABLE account ADD COLUMN weight_preference weight_preference_enum NOT NULL DEFAULT 'KG';