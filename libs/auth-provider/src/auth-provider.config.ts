import { registerAs } from '@nestjs/config';
import * as envalid from 'envalid';

export default registerAs('auth', () => {
  const env = envalid.cleanEnv(process.env, {
    AUTH_REGION: envalid.str(),
    USERPOOL_ID: envalid.str(),
  });

  const config = {
    region: env.AUTH_REGION,
    userpool: env.USERPOOL_ID,
  };

  return config;
});
