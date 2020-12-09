import { registerAs } from '@nestjs/config';
import * as envalid from 'envalid';
import Knex from 'knex';

export default registerAs('database', () => {
  const env = envalid.cleanEnv(process.env, {
    // POWER DATABASE
    DB_CLIENT: envalid.str({ default: 'pg' }),
    DB_USER: envalid.str(),
    DB_HOST: envalid.host(),
    DB_PASSWORD: envalid.str(),
    DB_PORT: envalid.num({ default: 5432 }),
    DB_DATABASE: envalid.str(),

    DB_USE_SSL: envalid.bool({ default: true }),
    DB_DEBUG: envalid.bool({ default: false }),

    // Connection Pool
    DB_POOL_MIN_CONNECTIONS: envalid.num({ default: 0 }),
    DB_POOL_MAX_CONNECTIONS: envalid.num({ default: 1 }),
    DB_POOL_IDLE_TIMEOUT_MILLIS: envalid.num({ default: 15000 }),

    // USER DATABASE
    USER_DB_CLIENT: envalid.str({ default: 'pg' }),
    USER_DB_USER: envalid.str(),
    USER_DB_HOST: envalid.host(),
    USER_DB_PASSWORD: envalid.str(),
    USER_DB_PORT: envalid.num({ default: 5432 }),
    USER_DB_DATABASE: envalid.str(),

    USER_DB_USE_SSL: envalid.bool({ default: true }),
    USER_DB_DEBUG: envalid.bool({ default: false }),

    // Connection Pool
    USER_DB_POOL_MIN_CONNECTIONS: envalid.num({ default: 0 }),
    USER_DB_POOL_MAX_CONNECTIONS: envalid.num({ default: 1 }),
    USER_DB_POOL_IDLE_TIMEOUT_MILLIS: envalid.num({ default: 15000 }),
  });

  const config: Knex.Config = {
    client: env.DB_CLIENT,
    connection: {
      host: env.DB_HOST,
      password: env.DB_PASSWORD,
      port: env.DB_PORT,
      user: env.DB_USER,
      database: env.DB_DATABASE,
      ssl: env.DB_USE_SSL,
    },
    pool: {
      min: env.DB_POOL_MIN_CONNECTIONS,
      max: env.DB_POOL_MAX_CONNECTIONS,
      idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT_MILLIS,
    },
    debug: env.DB_DEBUG,
  };

  const userConfig: Knex.Config = {
    client: env.USER_DB_CLIENT,
    connection: {
      host: env.USER_DB_HOST,
      password: env.USER_DB_PASSWORD,
      port: env.USER_DB_PORT,
      user: env.USER_DB_USER,
      database: env.USER_DB_DATABASE,
      ssl: env.USER_DB_USE_SSL,
    },
    pool: {
      min: env.USER_DB_POOL_MIN_CONNECTIONS,
      max: env.USER_DB_POOL_MAX_CONNECTIONS,
      idleTimeoutMillis: env.USER_DB_POOL_IDLE_TIMEOUT_MILLIS,
    },
    debug: env.USER_DB_DEBUG,
  };

  return { config, userConfig };
});
