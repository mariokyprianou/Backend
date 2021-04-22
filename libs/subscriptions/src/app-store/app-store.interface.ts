export type AppStoreToken = {
  receipt: string;
};

export interface AppStoreInAppPurchase {
  quantity: string;
  product_id: string;
  transaction_id: string;
  original_transaction_id: string;
  purchase_date: string;
  purchase_date_ms: string;
  purchase_date_pst: string;
  original_purchase_date: string;
  original_purchase_date_ms: string;
  original_purchase_date_pst: string;
  expires_date: string;
  expires_date_ms: string;
  expires_date_pst: string;
  web_order_line_item_id: string;
  is_trial_period: string;
  is_in_intro_offer_period: string;
}

export enum AppStoreEnvironment {
  Production = 'Production',
  Sandbox = 'Sandbox',
}

export interface AppStoreReceipt {
  receipt_type: AppStoreEnvironment;
  adam_id: number;
  app_item_id: number;
  bundle_id: string;
  application_version: string;
  download_id: number;
  version_external_identifier: number;
  receipt_creation_date: string;
  receipt_creation_date_ms: string;
  receipt_creation_date_pst: string;
  request_date: string;
  request_date_ms: string;
  request_date_pst: string;
  original_purchase_date: string;
  original_purchase_date_ms: string;
  original_purchase_date_pst: string;
  original_application_version: string;
  in_app: AppStoreInAppPurchase[];
}

export interface LatestReceiptInfo {
  quantity: string;
  product_id: string;
  transaction_id: string;
  original_transaction_id: string;
  purchase_date: string;
  purchase_date_ms: string;
  purchase_date_pst: string;
  original_purchase_date: string;
  original_purchase_date_ms: string;
  original_purchase_date_pst: string;
  expires_date: string;
  expires_date_ms: string;
  expires_date_pst: string;
  web_order_line_item_id: string;
  is_trial_period: 'true' | 'false';
  is_in_intro_offer_period: 'true' | 'false';
  in_app_ownership_type: string;
  subscription_group_identifier: string;
}

export enum ExpirationIntent {
  VoluntarilyCancelled = '1',
  BillingError = '2',
  CustomerRejectedPriceIncrease = '3',
  ProductUnavailable = '4',
  Unknown = '5',
}

export interface PendingRenewalInfo {
  auto_renew_product_id: string;
  original_transaction_id: string;
  product_id: string;
  auto_renew_status: '0' | '1';
  expiration_intent?: ExpirationIntent;
  grace_period_expires_date: string;
  grace_period_expires_date_ms: string;
  grace_period_expires_date_pst: string;
  is_in_billing_retry_period: '0' | '1';
  offer_code_ref_name: string;
  price_consent_status: '0' | '1';
  promotional_offer_id: string;
}

export interface VerifyReceiptRequest {
  'receipt-data': string;
  password: string;
  'exclude-old-transactions': boolean;
}

export interface VerifyReceiptResponse {
  environment: AppStoreEnvironment;
  status: number;
}

/**
 * @see https://developer.apple.com/documentation/appstorereceipts/responsebody
 */
export interface VerifyReceiptSuccessResponse extends VerifyReceiptResponse {
  receipt: AppStoreReceipt;
  latest_receipt_info?: LatestReceiptInfo[];
  latest_receipt: string;
  pending_renewal_info?: PendingRenewalInfo[];
}
