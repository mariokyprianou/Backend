import { google } from 'googleapis';
import type { androidpublisher_v3 as androidpublisher } from 'googleapis';
import { SubscriptionError, SubscriptionErrorCode } from '../errors';
import { GooglePlayToken } from './google-play.interface';
import { SubscriptionProvider } from '../subscription.interface';
import { GooglePlaySubscription } from './google-play.subscription';
import { SubscriptionModel } from '../model';
import { SubscriptionPlatform } from '../subscription.constants';

export type GooglePlayProviderCtorParams = {
  packageName: string;
  credentials: {
    clientEmail: string;
    privateKey: string;
  };
};

export class GooglePlaySubscriptionProvider implements SubscriptionProvider {
  public readonly platform = SubscriptionPlatform.GooglePlay;
  private readonly packageName: string;
  private readonly client: androidpublisher.Androidpublisher;

  constructor(params: GooglePlayProviderCtorParams) {
    this.packageName = params.packageName;
    const jwtCredentials = new google.auth.JWT(
      params.credentials.clientEmail,
      null,
      params.credentials.privateKey,
      ['https://www.googleapis.com/auth/androidpublisher'], // Auth scope for Play Developer API
      null,
    );

    this.client = google.androidpublisher({
      version: 'v3',
      auth: jwtCredentials,
    });
  }

  public async getSubscriptionInfo(
    model: SubscriptionModel,
  ): Promise<GooglePlaySubscription>;
  public async getSubscriptionInfo(
    providerToken: GooglePlayToken,
  ): Promise<GooglePlaySubscription>;

  public async getSubscriptionInfo(
    subscriptionOrToken: SubscriptionModel | GooglePlayToken,
  ): Promise<GooglePlaySubscription> {
    let providerToken: GooglePlayToken;
    if (subscriptionOrToken instanceof SubscriptionModel) {
      providerToken = subscriptionOrToken.providerToken as GooglePlayToken;

      let subscription: GooglePlaySubscription = null;
      try {
        subscription = GooglePlaySubscription.fromApiResponse(
          subscription.providerResponse,
          providerToken,
          subscription.lastVerifiedAt,
        );
      } catch (e) {
        console.log(
          'failed to load subscription data for token, refreshing: ' +
            JSON.stringify(providerToken),
          e,
        );
      }

      const isDefinitelyActive =
        subscription &&
        subscription.isActive &&
        !subscription.isAccountHold &&
        !subscription.isPaused;
      if (isDefinitelyActive) {
        // Do not need to query if we _know_ the subscription is still good
        return subscription;
      }
    } else {
      providerToken = subscriptionOrToken;
    }

    return this.getSubscriptionFromAPI(providerToken);
  }

  private async getSubscriptionFromAPI(token: GooglePlayToken) {
    try {
      const now = new Date();
      const response = await this.client.purchases.subscriptions.get({
        packageName: token.packageName ?? this.packageName,
        subscriptionId: token.productId,
        token: token.purchaseToken,
      });

      return GooglePlaySubscription.fromApiResponse(response.data, token, now);
    } catch (error) {
      if (error.code === 404) {
        throw new SubscriptionError(
          error.message,
          SubscriptionErrorCode.InvalidToken,
        );
      } else {
        throw new SubscriptionError(
          error.message,
          SubscriptionErrorCode.UnknownError,
        );
      }
    }
  }
}
