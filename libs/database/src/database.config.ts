import { registerAs } from '@nestjs/config';
import * as envalid from 'envalid';
import Knex from 'knex';

export default registerAs('database', () => {
  const env = envalid.cleanEnv(process.env, {
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

  return config;
});
