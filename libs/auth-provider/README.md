# Auth Provider

### How to

Create a config and import into the config loader for example, create a file with the registration function for the config module and reference in the `cms.module.ts`:

```TypeScript
// user-auth-keys.config.ts
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
```

```TypeScript
// config.module.ts

// ... module code
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [commonConfig, databaseConfig, userAuthKeysConfig], // add config file
    }),

// ... more code
```

Then when we come to import the module we reference the keys named in the env file as below. Note that we register the env file as user, and return an object.

```TypeScript
@Module({
  imports: [
    AuthProviderModule.register({
      name: 'USER',
      regionKey: 'user.region',
      userpoolKey: 'user.userpool',
    }),
    AuthProviderModule.register({
      name: 'ADMINS',
      regionKey: 'user.region',
      userpoolKey: 'user.cms_userpool',
    }),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```
