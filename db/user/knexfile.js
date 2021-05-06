const STAGES = ['development', 'qa', 'prod'];

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
        host: env.parsed.USER_DB_HOST,
        port: env.parsed.USER_DB_PORT || 5432,
        user: env.parsed.USER_DB_USER,
        password: env.parsed.USER_DB_PASSWORD,
        database: env.parsed.USER_DB_DATABASE,
      },
      seeds: {
        directory: `./seeds/${stage}`,
      },
      migrations: {
        tableName: 'knex_migrations',
        directory: './migration',
      },
    };

    if (stage === 'prod') {
      // Special case for prod as we expect DB access via an SSH Tunnel
      config[stage].connection.host = 'localhost';
      config[stage].connection.port = 38081;
    }

    console.log(JSON.stringify(config, null, 2));

    return config;
  } catch (e) {
    console.log(`File 'env.${stage}' not found, ignoring...`);
    return config;
  }
}, {});
module.exports = knexConfiguration;
