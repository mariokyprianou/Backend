const fs = require('fs');
const yaml = require('js-yaml');

const STAGES = ['local', 'development', 'staging', 'production'];

const DEFAULT = {
  client: 'pg',
  migrations: {
    tableName: 'knex_migrations',
    directory: './migration',
  },
};

const knexConfiguration = STAGES.reduce((config, stage) => {
  try {
    const seedStage = ['local', 'development'].includes(stage)
      ? 'development'
      : stage;

    const env = yaml.safeLoad(
      fs.readFileSync(`../../env.${stage}.yml`, 'utf8')
    );
    config[stage] = {
      ...DEFAULT,
      connection: {
        host: env.DB_HOSTNAME,
        port: env.DB_PORT || 5432,
        user: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
      },
      seeds: {
        directory: `./seeds/${seedStage}`,
      },
    };
    return config;
  } catch (e) {
    console.log(`File 'env.${stage}.yml' not found, ignoring...`);
    return config;
  }
}, {});

module.exports = knexConfiguration;
