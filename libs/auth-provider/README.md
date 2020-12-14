# Auth Provider

### How to

```TypeScript
@Module({
  imports: [
    AuthProviderModule.register({
      name: 'USER',
      region: 'region',
      userpool: 'userpool_id',
    }),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```
