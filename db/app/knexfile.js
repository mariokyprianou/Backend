const STAGES = ['development', 'qa', 'production'];

const DEFAULT = {
  client: 'pg',
  migrations: {
    tableName: 'knex_migrations',
    directory: './migration',
  },
};

const knexConfiguration = STAGES.reduce((config, stage) => {
  try {
    const env = require('dotenv').config({ path: `../../.env.${stage}` });
    config[stage] = {
      ...DEFAULT,
      connection: {
        host: env.parsed.DB_HOST,
        port: env.parsed.DB_PORT || 5432,
        user: env.parsed.DB_USER,
        password: env.parsed.DB_PASSWORD,
        database: env.parsed.DB_DATABASE,
      },
      seeds: {
        directory: `./seeds/${stage}`,
      },
      migrations: {
        tableName: 'knex_migrations',
        directory: './migration',
      },
    };

    return config;
  } catch (e) {
    console.log(`File 'env.${stage}' not found, ignoring...`);
    return config;
  }
}, {});

module.exports = knexConfiguration;
