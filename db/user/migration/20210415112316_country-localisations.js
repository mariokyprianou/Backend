/* eslint-disable @typescript-eslint/no-var-requires */
const countriesByLanguage = require('../country-data');
const uuid = require('uuid');
const Knex = require('knex');

function getFormattedData(dbCountries) {
  return Object.entries(countriesByLanguage.en).map(([code, name]) => {
    const existing = dbCountries.find(
      (country) => country.code.toLowerCase() === code.toLowerCase(),
    );
    const id = existing ? existing.id : uuid.v4();
    return {
      id,
      name,
      code,
      localisations: Object.entries(countriesByLanguage).map(
        ([language, countries]) => {
          return {
            country_id: id,
            language,
            name: countries[code],
          };
        },
      ),
    };
  });
}

/**
 * @param {Knex} db
 */
exports.up = async (db) => {
  await db.raw(`
  CREATE TABLE country_tr (
    id uuid CONSTRAINT pk_country_tr PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id uuid NOT NULL,
    language text NOT NULL,
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_country_tr_country FOREIGN KEY (country_id) REFERENCES country (id),
    CONSTRAINT uq_country_tr_country_language UNIQUE (country_id, language)
  );
  CREATE TRIGGER set_timestamp BEFORE UPDATE ON country_tr FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
  `);

  const existingCountries = await db.select('id', 'code').from('country');

  const countries = getFormattedData(existingCountries);

  const countryInserts = countries.map((country) => ({
    id: country.id,
    name: country.name,
    code: country.code,
  }));
  await db('country').insert(countryInserts).onConflict('id').merge();

  const translationInserts = countries
    .map((country) =>
      country.localisations.map((localisation) => ({
        id: uuid.v4(),
        language: localisation.language,
        country_id: country.id,
        name: localisation.name,
      })),
    )
    .flat();

  await db('country_tr').insert(translationInserts);
};

exports.down = async (db) => {
  const downdir = path.join(__dirname, 'down');
  const filename = path.basename(__filename, '.js');
  const filepath = path.join(downdir, `${filename}.sql`);
  const sql = await fs.readFile(filepath, { encoding: 'utf-8' });
  return db.raw(sql);
};
