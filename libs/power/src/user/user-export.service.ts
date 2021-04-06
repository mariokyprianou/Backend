import * as stream from 'stream';
import * as zlib from 'zlib';
import { stringify } from 'csv';
import * as through2 from 'through2';
import { User } from './user.model';
import { Account } from '..';
import { batchingStream, unbatchingStream } from './batch';
import { S3 } from 'aws-sdk';

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
        db.raw(`COALESCE(account.gender, 'unspecified') as gender`),
        db.raw('account.date_of_birth::date as "dateOfBirth"'),
        'country.name as country',
      )
      .from('account')
      .join('country', 'account.country_id', 'country.id')
      .orderBy('last_name')
      .stream();
  }

  private addAdditionalAttributes = () =>
    through2.obj(async function (batchUsers, enc, callback) {
      // Batch load user info from secondary db
      const accountIds = batchUsers.map((account) => account.id);

      // Email Marketing Preferences
      // todo: Subscriber Status
      // todo: Subscription Start Date
      // todo: Registration Date
      // todo: Billing cadence (yearly/monthly)
      const accounts = await Account.query()
        .select(
          'id',
          Account.knex().raw(
            `CASE emails WHEN true THEN 'Y' ELSE 'N' END as marketingEmails`,
          ),
          'created_at as createdAt',
        )
        .whereIn('id', accountIds);

      const accountsById = new Map();
      for (const account of accounts) {
        accountsById.set(account.id, account);
      }

      for (const user of batchUsers) {
        if (user.inspected_by_id) {
          const account = accountsById.get(user.id);
          if (account) {
            user.emailMarketing = account.emailMarketing;
          }
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
      .pipe(this.addAdditionalAttributes())
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
