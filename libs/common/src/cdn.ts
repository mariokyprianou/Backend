import { CloudFront, S3 } from 'aws-sdk';
import { Lazy } from './lazy';

export interface Signer {
  sign(url: string, opts: { expiresIn: number }): Promise<string>;
}

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
  constructor(
    private readonly distributionUrl: string,
    private readonly signer?: CloudfrontSigner,
  ) {}

  public async getSignedUrl(key: string, opts: { expiresIn: number }) {
    const url = `${this.distributionUrl}/${key}`;
    if (!this.signer) {
      return url;
    }
    return this.signer.sign(url, { expiresIn: opts.expiresIn });
  }
}

export class CloudfrontSigner implements Signer {
  private config: Lazy<CloudfrontConfig>;

  constructor(params: CloudfrontConfig | Lazy<CloudfrontConfig>) {
    if (params instanceof Lazy) {
      this.config = params;
    } else {
      this.config = new Lazy(() => Promise.resolve(params));
    }
  }

  public async sign(url: string, opts: { expiresIn?: number }) {
    const { privateKey, keypairId } = await this.config.get();
    return new CloudFront.Signer(keypairId, privateKey).getSignedUrl({
      url: url,
      expires: Math.floor(
        new Date().getTime() / 1000 + opts.expiresIn ?? 60 * 24,
      ),
    });
  }
}

export class ImageHandlerObjectStore implements ReadOnlyObjectStore {
  private readonly distributionUrl: string;
  private readonly bucket: string;
  private readonly signer?: CloudfrontSigner;

  constructor(params: {
    bucket: string;
    distributionUrl: string;
    signer?: CloudfrontSigner;
  }) {
    this.distributionUrl = params.distributionUrl;
    this.bucket = params.bucket;
    this.signer = params.signer;
  }

  public async getSignedUrl(
    key: string,
    opts: {
      expiresIn: number;
      resize?: {
        width: number;
      };
    },
  ) {
    const token = JSON.stringify({
      bucket: this.bucket,
      key,
      edits: {
        resize: opts.resize
          ? {
              width: opts.resize.width,
              fit: 'inside',
            }
          : undefined,
      },
    });

    const url = `${this.distributionUrl}/${Buffer.from(token, 'utf8').toString(
      'base64',
    )}`;

    if (this.signer) {
      return this.signer.sign(url, { expiresIn: opts.expiresIn });
    } else {
      return url;
    }
  }
}
