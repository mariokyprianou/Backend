import * as envalid from 'envalid';

export default () => {
  const env = envalid.cleanEnv(process.env, {});
  return {
    isProduction: env.isProduction,
    isDevelopment: env.isDevelopment,
  };
};
