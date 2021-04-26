/** Implementation detail - manual subscriptions should never be registered externally */
export type ManualToken = {
  accountId: string;
  expiresAt?: Date;
};

export type ManualProviderResponse = Record<string, unknown>;
