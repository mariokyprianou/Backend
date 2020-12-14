import { registerAs } from '@nestjs/config';
import * as envalid from 'envalid';

export default registerAs('user', () => {
  const env = envalid.cleanEnv(process.env, {
    AUTH_REGION: envalid.str(),
    USERPOOL_ID: envalid.str(),
    CMS_USERPOOL_ID: envalid.str(),
  });

  const config = {
    region: env.AUTH_REGION,
    userpool: env.USERPOOL_ID,
    cms_userpool: env.CMS_USERPOOL_ID,
  };

  return config;
});
