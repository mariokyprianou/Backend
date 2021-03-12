import axios, { AxiosInstance } from 'axios';
import * as rax from 'retry-axios';
import { endpoints, errorsByCode } from './app-store.constants';
import {
  AppStoreEnvironment,
  VerifyReceiptRequest,
  VerifyReceiptResponse,
  VerifyReceiptSuccessResponse,
} from './app-store.interface';
interface ErrorResponse {
  status: number;
  environment?: AppStoreEnvironment;
}
export class AppStoreError extends Error {
  public readonly status: number;
  public readonly response: any;

  constructor(response: ErrorResponse) {
    super(
      `${response.status}: ${
        errorsByCode[response.status] ?? 'Unknown error code'
      }`,
    );
    this.name = 'AppStoreError';
    this.status = response.status;
    this.response = response;
  }

  get isSandboxReceipt() {
    return this.status === 21007;
  }
}

export class AppStoreClient {
  private readonly client: AxiosInstance;
  private readonly sharedSecret: string;

  constructor(sharedSecret: string) {
    if (!sharedSecret) {
      throw new Error('App Store shared secret is required.');
    }
    this.client = axios.create();

    // Enable auto-retry
    rax.attach(this.client);

    this.sharedSecret = sharedSecret;
  }

  async verifyReceipt(receipt: string, excludeOldTransactions = true) {
    const request: VerifyReceiptRequest = {
      'receipt-data': receipt,
      password: this.sharedSecret,
      'exclude-old-transactions': excludeOldTransactions,
    };

    try {
      let response: VerifyReceiptSuccessResponse;
      try {
        response = await this.verify(AppStoreEnvironment.Production, request);
      } catch (e) {
        if (e instanceof AppStoreError && e.isSandboxReceipt) {
          response = await this.verify(AppStoreEnvironment.Sandbox, request);
        } else {
          throw e;
        }
      }

      return response;
    } catch (e) {
      console.log('verifyReceipt error', formatError(e));
      throw e;
    }
  }

  private async verify(
    environment: AppStoreEnvironment,
    request: {
      'receipt-data': string;
      password: string;
      'exclude-old-transactions': boolean;
    },
  ) {
    const response = await this.client.post<VerifyReceiptResponse>(
      `${endpoints[environment]}/verifyReceipt`,
      request,
      {
        raxConfig: {
          onRetryAttempt: (err) => {
            console.log(`verifyReceipt failure`, formatError(err));
          },
        },
      },
    );

    if (response.data && response.data.status !== 0) {
      console.log(
        'verifyReceipt failure',
        JSON.stringify({
          status: response.status,
          statusText: response.statusText,
          retry: false,
          response: response.data,
        }),
      );
      throw new AppStoreError(response.data);
    }

    return response.data as VerifyReceiptSuccessResponse;
  }
}

function formatError(err) {
  // log full error if unknown type
  if (!err.isAxiosError) {
    return err;
  }

  const cfg = rax.getConfig(err);
  const response = err.response || {};
  const errorSummary = {
    status: response.status,
    statusText: response.statusText,
    retry: true,
    retryAttempt: cfg.currentRetryAttempt,
    request: err.request,
    response: response.data,
  };

  return JSON.stringify(errorSummary);
}
