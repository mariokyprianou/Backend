# Power App

### Structure

All code withing `apps/app` is used for front end communication. There's two endpoints set up here. The first `/graphql` is unauthenticated served from `app.module.ts` and includes all the app modules.

The second is `/auth` and this is handled by `auth.module.ts` this includes all `app.modules.ts` as well as any auth modules. If a module has authenticated and unauthenticated endpoints then the folder will contain two modules, one for `AppModules` and on for `AuthModules`.

### Bundling GraphQL files

When attempting to bundle graphql files, all files that end in `app.graphql` will be included on both endpoints, but only files ending `auth.graphql` will be bundled for the `/auth` endpoint.
