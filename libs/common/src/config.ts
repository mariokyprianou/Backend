import * as envalid from 'envalid';

export default () => {
  const env = envalid.cleanEnv(process.env, {
    REGION: envalid.str(),
    REPORTS_BUCKET: envalid.str(),
  });
  return {
    storage: {
      reports: {
        region: env.REGION,
        bucket: env.REPORTS_BUCKET,
      },
    },
    isProduction: env.isProduction,
    isDevelopment: env.isDevelopment,
  };
};
