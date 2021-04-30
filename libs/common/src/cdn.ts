import { CloudFront, S3 } from 'aws-sdk';
import { Lazy } from './lazy';

export interface ReadOnlyObjectStore {
  getSignedUrl(key: string, opts: { expiresIn: number }): Promise<string>;
}

export class S3ObjectStore implements ReadOnlyObjectStore {
  private readonly s3: S3;
  private readonly bucket: string;

  constructor(params: { region: string; bucket: string }) {
    this.s3 = new S3({ region: params.region });
    this.bucket = params.bucket;
  }

  public getSignedUrl(Key: string, opts: { expiresIn: number }) {
    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.bucket,
      Key: Key,
      Expires: opts.expiresIn,
    });
  }
}

export type CloudfrontConfig = {
  url: string;
  keypairId: string;
  privateKey: string;
};

export class CloudfrontObjectStore implements ReadOnlyObjectStore {
  private config: Lazy<CloudfrontConfig>;

  constructor(params: CloudfrontConfig | Lazy<CloudfrontConfig>) {
    if (params instanceof Lazy) {
      this.config = params;
    } else {
      this.config = new Lazy(() => Promise.resolve(params));
    }
  }

  public async getSignedUrl(key: string, opts: { expiresIn: number }) {
    const { url, privateKey, keypairId } = await this.config.get();

    return new CloudFront.Signer(keypairId, privateKey).getSignedUrl({
      url: `${url}/${key}`,
      expires: Math.floor(new Date().getTime() / 1000 + opts.expiresIn),
    });
  }
}
