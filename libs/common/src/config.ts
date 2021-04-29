import * as envalid from 'envalid';

export default () => {
  const env = envalid.cleanEnv(process.env, {
    REGION: envalid.str(),
    REPORTS_BUCKET_REGION: envalid.str({ default: process.env.REGION }),
    REPORTS_BUCKET: envalid.str(),
    VIDEO_BUCKET_REGION: envalid.str({ default: process.env.REGION }),
    VIDEO_BUCKET_DESTINATION: envalid.str(),
    FILES_BUCKET_REGION: envalid.str({ default: process.env.REGION }),
    FILES_BUCKET: envalid.str(),
  });

  return {
    storage: {
      files: {
        region: env.FILES_BUCKET_REGION,
        bucket: env.FILES_BUCKET,
      },
      videos: {
        region: env.VIDEO_BUCKET_REGION,
        bucket: env.VIDEO_BUCKET_DESTINATION,
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
