import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AuthProviderService {
  constructor(@Inject('AUTH_PROVIDER') private authProvider: any) {}

  public async registerUser(username: string, password: string, options?: any) {
    const UserPoolId = this.authProvider.config.userpool;
    // Use aws sdk to register a user as admin
    const ap = {
      UserPoolId,
      Username: username,
      ...options,
    };

    const user = await this.authProvider.cognito.adminCreateUser(ap).promise();

    // Set the users password
    await this.authProvider.cognito.adminSetUserPassword({
      Password: [password],
      UserPoolId,
      Username: user.data.User.Username,
      Permanent: true,
    });

    return user;
  }
}
