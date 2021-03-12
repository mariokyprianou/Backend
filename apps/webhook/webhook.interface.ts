export interface Webhook<T> {
  provider: string;
  body: T;
}
