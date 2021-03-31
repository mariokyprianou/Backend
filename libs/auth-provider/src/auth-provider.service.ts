import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { AdminCreateUserRequest } from 'aws-sdk/clients/cognitoidentityserviceprovider';

@Injectable()
export class AuthProviderService {
  cognito: CognitoIdentityServiceProvider;
  UserPoolId: string;
  ClientId: string;

  constructor(
    @Inject('AUTH_OPTIONS')
    private options: {
      regionKey: string;
      userpoolKey: string;
      clientId?: string;
    },
    private config: ConfigService,
  ) {
    this.cognito = new CognitoIdentityServiceProvider({
      region: this.config.get(this.options.regionKey),
    });
    this.UserPoolId = this.config.get(this.options.userpoolKey);
    this.ClientId = this.config.get(this.options.clientId);
  }

  public async register(
    Username: string,
    Password?: string,
    options?: Partial<AdminCreateUserRequest>,
  ) {
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

  public async registerWithEmailVerificationLink(
    Username: string,
    Password: string,
    options?: Partial<CognitoIdentityServiceProvider.SignUpRequest>,
  ) {
    return this.cognito
      .signUp({
        ClientId: this.ClientId,
        Password,
        Username,
        ...options,
      })
      .promise();
  }

  public async resendEmailVerificationLink(Username: string) {
    return this.cognito
      .resendConfirmationCode({
        ClientId: this.ClientId,
        Username,
      })
      .promise();
  }

  public async delete(Username: string) {
    const userToDelete = await this.getUser(Username);

    await this.cognito
      .adminDeleteUser({
        Username,
        UserPoolId: this.UserPoolId,
      })
      .promise();

    return userToDelete;
  }

  public async updateAttributes(
    Username: string,
    UserAttributes: { Name: string; Value: string }[],
  ) {
    await this.cognito
      .adminUpdateUserAttributes({
        Username,
        UserPoolId: this.UserPoolId,
        UserAttributes,
      })
      .promise();

    return this.getUser(Username);
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
  public async listUsers(
    props: {
      Filter?: string;
      Limit?: number;
      PaginationToken?: string;
    } = {},
  ) {
    const params = {
      UserPoolId: this.UserPoolId,
      ...props,
    };
    return this.cognito.listUsers(params).promise();
  }

  public async login(USERNAME: string, PASSWORD: string) {
    const params = {
      AuthParameters: { USERNAME, PASSWORD },
      UserPoolId: this.UserPoolId,
      ClientId: this.ClientId,
      AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
    };

    return this.cognito.adminInitiateAuth(params).promise();
  }
}
