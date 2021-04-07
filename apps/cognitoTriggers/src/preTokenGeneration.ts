import { PreTokenGenerationTriggerHandler } from 'aws-lambda';
import { databaseConfig } from '@lib/database';
import * as Knex from 'knex';
import { Account } from '@lib/power';

const database: Promise<Knex> = (async () => {
  const { config } = databaseConfig();
  return Knex(config);
})();

const preTokenGenerationHandler: PreTokenGenerationTriggerHandler = async (
  event,
  context,
) => {
  console.log('preTokenGeneration', JSON.stringify(event));

  // Lookup username from cognito sub to avoid having to do this on every API call
  const db = await database;
  const account = await Account.query(db).findOne(
    'cognito_username',
    event.userName,
  );
  if (account) {
    event.response = {
      claimsOverrideDetails: {
        claimsToAddOrOverride: {
          uid: account.id,
        },
      },
    };
  }

  return event;
};

export default preTokenGenerationHandler;
