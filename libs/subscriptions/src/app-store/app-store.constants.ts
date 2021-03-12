import { AppStoreEnvironment } from './app-store.interface';

export const APP_STORE_PROVIDER_NAME = 'appstore';

export const endpoints: { [env in AppStoreEnvironment]: string } = {
  [AppStoreEnvironment.Sandbox]: 'https://sandbox.itunes.apple.com',
  [AppStoreEnvironment.Production]: 'https://buy.itunes.apple.com',
};

export const errorsByCode: { [code: number]: string } = {
  21000: 'The App Store could not read the JSON object you provided.',
  21002: 'The data in the receipt-data property was malformed or missing.',
  21003: 'The receipt could not be authenticated.',
  21004: 'The shared secret you provided does not match the shared secret on file for your account.',
  21005: 'The receipt server is not currently available.',
  21006: 'This receipt is valid but the subscription has expired. When this status code is returned to your server, the receipt data is also decoded and returned as part of the response.',
  21007: 'This receipt is a sandbox receipt, but it was sent to the production service for verification.',
  21008: 'This receipt is a production receipt, but it was sent to the sandbox service for verification.',
};
