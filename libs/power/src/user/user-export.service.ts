import * as stream from 'stream';
import * as zlib from 'zlib';
import { stringify } from 'csv';
import * as through2 from 'through2';
import { User } from './user.model';
import { Account } from '../account';
import { batchingStream, unbatchingStream } from './batch';
import { S3 } from 'aws-sdk';
import { SubscriptionPlanSku } from 'libs/subscriptions/src/subscription.constants';

export type ExportUsersResponse = {
  downloadUrl: string;
};

export type UserExportServiceCtorParams = {
  s3Client: S3;
  bucketName: string;
};

export class UserExportService {
  private readonly s3: S3;
  private readonly bucketName: string;

  constructor(params: UserExportServiceCtorParams) {
    this.s3 = params.s3Client;
    this.bucketName = params.bucketName;
  }

  private uploadToS3(key: string) {
    const passThrough = new stream.PassThrough();
    const params = {
      Body: passThrough,
      Bucket: this.bucketName,
      Key: key,
      ContentType: 'text/csv',
      ContentEncoding: 'gzip',
    };
    return {
      promise: this.s3.upload(params).promise(),
      stream: passThrough,
    };
  }

  private getUserQueryStream() {
    const db = User.knex();
    return db
      .select(
        'account.id as id',
        'account.first_name as firstName',
        'account.last_name as lastName',
        'account.email as email',
        'account.allow_email_marketing as emailMarketing',
        db.raw(`COALESCE(account.gender, 'unspecified') as gender`),
        db.raw('account.date_of_birth::date as "dateOfBirth"'),
        'country.name as country',
      )
      .from('account')
      .join('country', 'account.country_id', 'country.id')
      .orderBy('last_name')
      .stream();
  }

  private addSubscriptionAttributes = () =>
    through2.obj(async function (batchUsers, enc, callback): Promise<void> {
      // Batch load user info from secondary db
      const accountIds = batchUsers.map((account) => account.id);

      const db = Account.knex();
      const subscriptions = await db
        .select(
          db.raw('distinct on (account.id) account.id as "accountId"'),
          'subscription.sku as sku',
          'subscription.created_at as startDate',
          'subscription.provider as platform',
        )
        .from('account')
        .leftJoin('subscription', 'account.id', 'subscription.account_id')
        .whereIn('account.id', accountIds)
        .orderBy('account.id')
        .orderBy('subscription.expires_at', 'desc');

      const subscriptionsByAccountId = new Map();
      for (const subscription of subscriptions) {
        subscriptionsByAccountId.set(subscription.accountId, subscription);
      }

      for (const user of batchUsers) {
        const subscription = subscriptionsByAccountId.get(user.id);
        if (subscription) {
          let billingCadence: string;
          switch (subscription.sku) {
            case SubscriptionPlanSku.LIFETIME:
              billingCadence = 'lifetime';
            case SubscriptionPlanSku.YEARLY:
              billingCadence = 'yearly';
            case SubscriptionPlanSku.YEARLY:
              billingCadence = 'monthly';
            default:
              billingCadence = subscription.sku;
          }

          user.subscriptionBillingCadence = billingCadence;
          user.subscriptionStartDate = subscription.startDate;
          user.subscriptionPlatform = subscription.platform;
        }
      }

      this.push(batchUsers);
      callback();
    });

  public async exportUsers(): Promise<ExportUsersResponse> {
    const fileKey = this.generateExportFilename();
    const { stream: s3WritableStream, promise: s3Upload } = this.uploadToS3(
      fileKey,
    );

    this.getUserQueryStream()
      .on('error', (e) => console.log('stream error', e))
      .pipe(batchingStream(100))
      .pipe(this.addSubscriptionAttributes())
      .pipe(unbatchingStream())
      .pipe(
        stringify({
          header: true,
          columns: [
            { key: 'firstName', header: 'First Name' },
            { key: 'lastName', header: 'Last Name' },
            { key: 'email', header: 'Email' },
            { key: 'gender', header: 'Gender' },
            { key: 'dateOfBirth', header: 'Date of Birth' },
            { key: 'country', header: 'Country' },
            { key: 'emailMarketing', header: 'Email Marketing' },
            { key: 'createdAt', header: 'Registration Date' },
            { key: 'subscriptionPlatform', header: 'Subscription Platform' },
            { key: 'subscriptionPlatform', header: 'Subscription Start Date' },
            {
              key: 'subscriptionBillingCadence',
              header: 'Subscription Billing Cadence',
            },
          ],
        }),
      )
      .pipe(zlib.createGzip())
      .pipe(s3WritableStream);

    await s3Upload;

    const downloadUrl = this.s3.getSignedUrl('getObject', {
      Bucket: this.bucketName,
      Key: fileKey,
      Expires: 60 * 60 * 24,
    });

    return { downloadUrl };
  }

  private generateExportFilename() {
    const date = new Date().toISOString();
    return `user-exports/user-export-${date}.csv`;
  }
}
