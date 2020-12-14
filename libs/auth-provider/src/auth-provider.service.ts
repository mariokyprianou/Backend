import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

@Injectable()
export class AuthProviderService {
  cognito: CognitoIdentityServiceProvider;
  UserPoolId: string;

  constructor(private config: ConfigService) {
    console.log(this.config.get<string>('auth.region'));
    this.cognito = new CognitoIdentityServiceProvider({
      region: this.config.get<string>('auth.region'),
    });
    this.UserPoolId = this.config.get<string>('auth.userpool');
  }

  public async register(Username: string, Password: string, options?: any) {
    // Use aws sdk to register a user as admin
    const ap = {
      UserPoolId: this.UserPoolId,
      Username,
      ...options,
    };
    const user = await this.cognito.adminCreateUser(ap).promise();

    // Set the users password
    await this.cognito
      .adminSetUserPassword({
        Password,
        UserPoolId: this.UserPoolId,
        Username: user.User.Username,
        Permanent: true,
      })
      .promise();

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
}
