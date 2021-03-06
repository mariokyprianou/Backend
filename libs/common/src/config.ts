import * as envalid from 'envalid';

export default () => {
  const env = envalid.cleanEnv(process.env, {
    REGION: envalid.str(),
    REPORTS_BUCKET_REGION: envalid.str({ default: process.env.REGION }),
    REPORTS_BUCKET: envalid.str(),
    VIDEO_BUCKET_REGION: envalid.str({ default: process.env.REGION }),
    VIDEO_BUCKET_DESTINATION: envalid.str(),
    VIDEO_BUCKET_CLOUDFRONT_DISTRIBUTION_URL: envalid.str(),
    FILES_BUCKET_REGION: envalid.str({ default: process.env.REGION }),
    FILES_BUCKET: envalid.str(),
    FILES_BUCKET_CLOUDFRONT_DISTRIBUTION_URL: envalid.str(),

    VIDEO_CLOUDFRONT_ENABLED: envalid.bool({ default: false }),

    JWT_ISSUER: envalid.url(),
    JWT_SECRET: envalid.str(),
  });

  return {
    jwt: {
      issuer: env.JWT_ISSUER,
      secret: env.JWT_SECRET,
    },
    storage: {
      files: {
        region: env.FILES_BUCKET_REGION,
        bucket: env.FILES_BUCKET,
        distributionUrl: env.FILES_BUCKET_CLOUDFRONT_DISTRIBUTION_URL,
      },
      videos: {
        region: env.VIDEO_BUCKET_REGION,
        bucket: env.VIDEO_BUCKET_DESTINATION,
        distributionUrl: env.VIDEO_BUCKET_CLOUDFRONT_DISTRIBUTION_URL,
      },
      reports: {
        region: env.REPORTS_BUCKET_REGION,
        bucket: env.REPORTS_BUCKET,
      },
    },
    isProduction: env.isProduction,
    isDevelopment: env.isDevelopment,
  };
};
