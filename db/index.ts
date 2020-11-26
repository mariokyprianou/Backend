import knex from 'knex';
import { SecretsManager } from 'aws-sdk';

// use require to prevent console.errors
const Pg = require('pg');

// Prevent pg from parsing simple "date" columns into full JS dates and causing timezone headaches
Pg.types.setTypeParser(1082, text => text);
// Parse timestamps as dates
Pg.types.setTypeParser(1184, text => new Date(text));

let userDb = null;
export const createUserDb = async () => {
  if (userDb) {
    return userDb;
  }

  const { USER_DB_SECRET_ARN, USER_DB_NAME } = process.env;
  let {
    USER_DB_HOSTNAME,
    USER_DB_USERNAME,
    USER_DB_PASSWORD,
    USER_DB_PORT,
  } = process.env;

  if (USER_DB_SECRET_ARN) {
    const secretsClient = new SecretsManager();
    const dbConnectionParams = await secretsClient
      .getSecretValue({
        SecretId: USER_DB_SECRET_ARN,
      })
      .promise();

    const secrets = JSON.parse(dbConnectionParams.SecretString);
    USER_DB_HOSTNAME = secrets.host;
    USER_DB_PASSWORD = secrets.password;
    USER_DB_PORT = secrets.port;
    USER_DB_USERNAME = secrets.username;
  }

  userDb = knex({
    debug: true,
    client: 'pg',
    connection: {
      host: USER_DB_HOSTNAME,
      user: USER_DB_USERNAME,
      password: USER_DB_PASSWORD,
      database: USER_DB_NAME,
      port: Number(USER_DB_PORT),
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './app/migration',
    },
    pool: {
      min: 0,
      max: 1,
    },
  });

  return userDb;
};

const secretsClient = new SecretsManager({
  maxRetries: 8,
});

let db = null;
export const createDb = async () => {
  if (db) {
    return db;
  }

  const { DB_SECRET_ARN, DB_NAME } = process.env;
  let { DB_HOSTNAME, DB_USERNAME, DB_PASSWORD, DB_PORT } = process.env;

  if (DB_SECRET_ARN) {
    const dbConnectionParams = await secretsClient
      .getSecretValue({ SecretId: DB_SECRET_ARN })
      .promise();

    const secrets = JSON.parse(dbConnectionParams.SecretString);
    DB_HOSTNAME = secrets.host;
    DB_PASSWORD = secrets.password;
    DB_PORT = secrets.port;
    DB_USERNAME = secrets.username;
  }

  db = knex({
    client: 'pg',
    connection: {
      host: DB_HOSTNAME,
      user: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: Number(DB_PORT),
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './user/migration',
    },
    pool: {
      min: 0,
      max: 1,
    },
  });

  return db;
};
