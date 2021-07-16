import { Injectable } from '@nestjs/common';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import {
  AdminCreateUserRequest,
  AdminGetUserResponse,
  ListUsersResponse,
} from 'aws-sdk/clients/cognitoidentityserviceprovider';

@Injectable()
export class AuthProviderService {
  cognito: CognitoIdentityServiceProvider;
  userPoolId: string;
  clientId: string;

  constructor(cognitoSettings: {
    region: string;
    userpoolId: string;
    clientId?: string;
  }) {
    this.cognito = new CognitoIdentityServiceProvider({
      region: cognitoSettings.region,
    });
    this.userPoolId = cognitoSettings.userpoolId;
    this.clientId = cognitoSettings.clientId;
  }

  public async register(
    username: string,
    password?: string,
    options?: Partial<AdminCreateUserRequest>,
  ) {
    const user = await this.cognito
      .adminCreateUser({
        UserPoolId: this.userPoolId,
        Username: username,
        ...options,
      })
      .promise();

    if (password) {
      // Set the users password
      await this.cognito
        .adminSetUserPassword({
          UserPoolId: this.userPoolId,
          Username: user.User.Username,
          Password: password,
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
    const response = await this.cognito
      .signUp({
        ClientId: this.clientId,
        Password,
        Username,
        ...(options ?? {}),
      })
      .promise();

    return response.UserSub;
  }

  public async resendEmailVerificationLink(username: string) {
    return this.cognito
      .resendConfirmationCode({
        ClientId: this.clientId,
        Username: username,
      })
      .promise();
  }

  public async delete(username: string) {
    const user = await this.getUser(username);

    await this.cognito
      .adminDeleteUser({
        Username: username,
        UserPoolId: this.userPoolId,
      })
      .promise();

    return user;
  }

  public async updateAttributes(
    Username: string,
    UserAttributes: { Name: string; Value: string }[],
  ): Promise<AdminGetUserResponse> {
    await this.cognito
      .adminUpdateUserAttributes({
        Username,
        UserPoolId: this.userPoolId,
        UserAttributes,
      })
      .promise();

    return this.getUser(Username);
  }

  public async getUser(Username: string): Promise<AdminGetUserResponse> {
    return this.cognito
      .adminGetUser({ UserPoolId: this.userPoolId, Username })
      .promise();
  }

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#listUsers-property
  // Warning: Not suitable for large user sets due to cognito rate limiting.
  public async listUsers(
    props: {
      Filter?: string;
      Limit?: number;
      PaginationToken?: string;
    } = {},
  ): Promise<ListUsersResponse> {
    const params = {
      UserPoolId: this.userPoolId,
      ...props,
    };
    return this.cognito.listUsers(params).promise();
  }

  public async login(USERNAME: string, PASSWORD: string) {
    const params = {
      AuthParameters: { USERNAME, PASSWORD },
      UserPoolId: this.userPoolId,
      ClientId: this.clientId,
      AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
    };

    return this.cognito.adminInitiateAuth(params).promise();
  }
}
