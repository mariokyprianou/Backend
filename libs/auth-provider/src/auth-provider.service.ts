import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

@Injectable()
export class AuthProviderService {
  cognito: CognitoIdentityServiceProvider;
  UserPoolId: string;

  constructor(
    @Inject('AUTH_OPTIONS')
    private options: { regionKey: string; userpoolKey: string },
    private config: ConfigService,
  ) {
    this.cognito = new CognitoIdentityServiceProvider({
      region: this.config.get(this.options.regionKey),
    });
    this.UserPoolId = this.config.get(this.options.userpoolKey);
  }

  public async register(Username: string, Password?: string, options?: any) {
    // Use aws sdk to register a user as admin
    const ap = {
      UserPoolId: this.UserPoolId,
      Username,
      ...options,
    };
    const user = await this.cognito.adminCreateUser(ap).promise();

    if (Password) {
      // Set the users password
      await this.cognito
        .adminSetUserPassword({
          Password,
          UserPoolId: this.UserPoolId,
          Username: user.User.Username,
          Permanent: true,
        })
        .promise();
    }

    return user;
  }

  public async delete(Username: string) {
    return this.cognito
      .adminDeleteUser({
        Username,
        UserPoolId: this.UserPoolId,
      })
      .promise();
  }

  public async updateAttributes(
    Username: string,
    UserAttributes: { Name: string; Value: string }[],
  ) {
    //     UserAttributes: [ /* required */
    // {
    //     Name: 'STRING_VALUE', /* required */
    //     Value: 'STRING_VALUE'
    //   },
    //   /* more items */
    // ],
    return this.cognito
      .adminUpdateUserAttributes({
        Username,
        UserPoolId: this.UserPoolId,
        UserAttributes,
      })
      .promise();
  }

  public async getUser(Username: string) {
    const params = {
      UserPoolId: this.UserPoolId,
      Username,
    };

    return this.cognito.adminGetUser(params).promise();
  }

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#listUsers-property
  // Warning: Not suitable for large user sets due to cognito rate limiting.
  public async listUsers(props: {
    Filter?: string;
    Limit?: number;
    PaginationToken?: string;
  }) {
    const params = {
      UserPoolId: this.UserPoolId,
      ...props,
    };
    return this.cognito.listUsers(params).promise();
  }
}
