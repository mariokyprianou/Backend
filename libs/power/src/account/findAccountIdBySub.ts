import { Account } from './account.model';

export function findAccountByCognitoSub(cognitoSub: string): Promise<Account> {
  return Account.query().findOne('cognito_username', cognitoSub).debug();
}
