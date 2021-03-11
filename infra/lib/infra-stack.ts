import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';
import * as s3 from '@aws-cdk/aws-s3';
import * as sqs from '@aws-cdk/aws-sqs';
import { CfnOutput, Duration, RemovalPolicy } from '@aws-cdk/core';
import { DeploymentStage } from './interface';
import * as _ from 'lodash';

export interface InfraStackPropsVpcConfig {
  /**
   * The number of availability zones to deploy NAT providers into (default 0).
   * - In production this will deploy a NAT Gateway into each private subnet (~£40/mo)
   * - In development this will deploy a cheaper NAT Instance into each private subnet (~£5/mo)
   */
  natGateways?: number;
  /**
   * The maximum number of availability zones to deploy, default is 1.
   * If 0 is specified then this will deploy into every az in the region.
   */
  maxAzs?: number;
}

export interface InfraStackDatabaseConfig {
  /**
   * The instance type - defaults to t3.micro
   */
  instanceType?: ec2.InstanceType;
}

export interface InfraStackCognitoConfig {
  foo?: 'bar';
}

export interface InfraStackProps extends cdk.StackProps {
  project: string;
  stage: DeploymentStage;
  vpc?: InfraStackPropsVpcConfig;
  database?: InfraStackDatabaseConfig;
  userPool?: InfraStackCognitoConfig;
  cmsUserPool?: InfraStackCognitoConfig;
}

export class InfraStack extends cdk.Stack {
  public readonly stage: DeploymentStage;
  public readonly resourcePrefix: string;
  public readonly vpc?: ec2.Vpc;
  public readonly database?: rds.DatabaseInstance;
  public readonly userPool?: cognito.CfnUserPool;
  public readonly cmsUserPool?: cognito.CfnUserPool;

  constructor(scope: cdk.Construct, id: string, props: InfraStackProps) {
    super(scope, id, props);
    this.resourcePrefix = `${props.project}-${props.stage}`;
    this.stage = props.stage;

    cdk.Tags.of(this).add('Project', props.project);
    cdk.Tags.of(this).add('Environment', props.stage);

    if (props.vpc) {
      this.vpc = this.addVpc(props.vpc);
    }

    if (props.database) {
      this.database = this.addPostgres(props.database);
    }

    if (props.userPool) {
      this.userPool = this.addCognitoUserPool(props.userPool);
    }

    if (props.cmsUserPool) {
      this.cmsUserPool = this.addCognitoCmsUserPool(props.cmsUserPool);
    }

    this.addS3Bucket('Assets');
    this.addS3Bucket('Reports');

    this.addQueue('IncomingWebhooks');
  }

  get isProduction() {
    return this.stage === DeploymentStage.PRODUCTION;
  }

  private addOutput(scope: cdk.Construct, name: string, value: string) {
    return new CfnOutput(scope, name, { value });
  }

  // See: https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-ec2.Vpc.html
  private addVpc(config: InfraStackPropsVpcConfig) {
    let natProvider: ec2.NatProvider | undefined;
    if (config.natGateways ?? 0 > 0) {
      if (this.isProduction) {
        natProvider = ec2.NatProvider.gateway();
      } else {
        natProvider = ec2.NatProvider.instance({
          instanceType: ec2.InstanceType.of(
            ec2.InstanceClass.T3,
            ec2.InstanceSize.NANO,
          ),
        });
      }
    }

    const vpc = new ec2.Vpc(this, 'VPC', {
      maxAzs: config.maxAzs,
      natGateways: config.natGateways,
      natGatewayProvider: natProvider,
    });

    if (config.natGateways ?? 0 > 0) {
      // S3 Gateway - allows access to S3 from within a private subnet
      new ec2.GatewayVpcEndpoint(this, 'S3GatewayVpcEndpoint', {
        vpc,
        service: ec2.GatewayVpcEndpointAwsService.S3,
      });

      // Dynamo Gateway - allows access to S3 from within a private subnet
      new ec2.GatewayVpcEndpoint(this, 'DynamoDbGatewayVpcEndpoint', {
        vpc,
        service: ec2.GatewayVpcEndpointAwsService.DYNAMODB,
      });
    }

    this.addOutput(this, 'VpcId', vpc.vpcId);

    vpc.publicSubnets.forEach((subnet, idx) =>
      this.addOutput(this, `VpcPublicSubnet${idx + 1}Id`, subnet.subnetId),
    );
    vpc.privateSubnets.forEach((subnet, idx) =>
      this.addOutput(this, `VpcPrivateSubnet${idx + 1}Id`, subnet.subnetId),
    );
    vpc.isolatedSubnets.forEach((subnet, idx) =>
      this.addOutput(this, `VpcIsolatedSubnet${idx + 1}Id`, subnet.subnetId),
    );

    return vpc;
  }

  private addPostgres(config: InfraStackDatabaseConfig) {
    const dbName = 'Postgres';

    const vpc =
      this.vpc ?? ec2.Vpc.fromLookup(this, 'DefaultVpc', { isDefault: true });

    const instance = new rds.DatabaseInstance(this, dbName, {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_12,
      }),
      instanceType:
        config.instanceType ??
        ec2.InstanceType.of(
          ec2.InstanceClass.BURSTABLE3,
          ec2.InstanceSize.MICRO,
        ),
      storageEncrypted: true,
      allocatedStorage: 5,
      backupRetention: Duration.days(0),
      vpc,
      vpcSubnets: {
        subnetType: this.isProduction
          ? ec2.SubnetType.ISOLATED
          : ec2.SubnetType.PUBLIC,
      },
    });

    instance.connections.securityGroups.forEach((sg) => {
      instance.connections.allowFrom(sg, ec2.Port.tcp(5432));
    });

    this.addOutput(this, `${dbName}Host`, instance.instanceEndpoint.hostname);
    this.addOutput(
      this,
      `${dbName}Address`,
      instance.instanceEndpoint.socketAddress,
    );
    this.addOutput(this, `${dbName}SecretArn`, instance.secret!.secretArn);

    return instance;
  }

  private addCognitoUserPool(config: InfraStackCognitoConfig) {
    const usernameConfiguration = {
      caseSensitive: false,
    };

    // The set up for a user pool that requires email verification through a link.
    // TODO: Configure a domain
    const userPool = new cognito.CfnUserPool(this, 'UserPool', {
      adminCreateUserConfig: {
        // allowAdminCreateUserOnly: true,
      },
      policies: {
        passwordPolicy: {
          minimumLength: 8,
          requireLowercase: true,
          requireNumbers: true,
          requireUppercase: true,
          requireSymbols: true,
        },
      },
      autoVerifiedAttributes: ['email'],
      emailVerificationSubject: 'Your Power verification link',
      userPoolName: `app-${this.resourcePrefix}-userpool`,
      usernameConfiguration,
      usernameAttributes: ['email'],
      accountRecoverySetting: {
        recoveryMechanisms: [
          {
            name: 'verified_email',
            priority: 1,
          },
        ],
      },
      verificationMessageTemplate: {
        defaultEmailOption: 'CONFIRM_WITH_LINK',
      },
    });
    userPool.applyRemovalPolicy(RemovalPolicy.RETAIN);

    this.addOutput(this, 'UserPoolId', userPool.ref);
    this.addOutput(this, 'UserPoolArn', userPool.attrArn);

    const frontendUserPoolClient = new cognito.CfnUserPoolClient(
      this,
      'FrontendUserPoolClient',
      {
        userPoolId: userPool.ref,
        clientName: `${this.resourcePrefix}-userpoolclient-frontend`,
        explicitAuthFlows: ['ALLOW_REFRESH_TOKEN_AUTH', 'ALLOW_USER_SRP_AUTH'],
        generateSecret: false,
        preventUserExistenceErrors: 'ENABLED',
        readAttributes: ['email', 'email_verified'],
      },
    );
    frontendUserPoolClient.applyRemovalPolicy(RemovalPolicy.RETAIN);

    this.addOutput(
      this,
      'FrontendUserPoolClientId',
      frontendUserPoolClient.ref,
    );

    const backendUserPoolClient = new cognito.CfnUserPoolClient(
      this,
      'BackendUserPoolClient',
      {
        userPoolId: userPool.ref,
        clientName: `${this.resourcePrefix}-userpoolclient-backend`,
        explicitAuthFlows: [
          'ALLOW_ADMIN_USER_PASSWORD_AUTH',
          'ALLOW_REFRESH_TOKEN_AUTH',
        ],
        preventUserExistenceErrors: 'ENABLED',
        generateSecret: false,
      },
    );
    backendUserPoolClient.applyRemovalPolicy(RemovalPolicy.RETAIN);
    this.addOutput(this, 'BackendUserPoolClientId', backendUserPoolClient.ref);

    return userPool;
  }

  private addS3Bucket(name: string) {
    const bucket = new s3.Bucket(this, `${name}Bucket`, {
      bucketName: `${this.resourcePrefix}-${name.toLowerCase()}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    this.addOutput(this, `${name}BucketArn`, bucket.bucketArn);
    this.addOutput(this, `${name}BucketName`, bucket.bucketName);

    return bucket;
  }

  private addCognitoCmsUserPool(config: InfraStackCognitoConfig) {
    const usernameConfiguration = {
      caseSensitive: false,
    };
    const userPool = new cognito.CfnUserPool(this, 'CMSUserPool', {
      adminCreateUserConfig: {
        allowAdminCreateUserOnly: true,
      },
      policies: {
        passwordPolicy: {
          minimumLength: 8,
          requireLowercase: true,
          requireNumbers: true,
          requireUppercase: true,
          requireSymbols: true,
        },
      },
      schema: [
        {
          name: 'name',
          required: false,
          attributeDataType: 'String',
          mutable: true,
        },
      ],
      userPoolName: `cms-${this.resourcePrefix}-userpool`,
      usernameAttributes: ['email'],
      usernameConfiguration,
      accountRecoverySetting: {
        recoveryMechanisms: [
          {
            name: 'verified_email',
            priority: 1,
          },
        ],
      },
    });
    userPool.applyRemovalPolicy(RemovalPolicy.RETAIN);
    this.addOutput(this, 'CmsUserPoolId', userPool.ref);
    this.addOutput(this, 'CmsUserPoolArn', userPool.attrArn);
    const frontendUserPoolClient = new cognito.CfnUserPoolClient(
      this,
      'CmsFrontendUserPoolClient',
      {
        userPoolId: userPool.ref,
        clientName: `cms-${this.resourcePrefix}-userpoolclient-frontend`,
        explicitAuthFlows: ['ALLOW_REFRESH_TOKEN_AUTH', 'ALLOW_USER_SRP_AUTH'],
        generateSecret: false,
        preventUserExistenceErrors: 'ENABLED',
        readAttributes: ['email'],
      },
    );
    frontendUserPoolClient.applyRemovalPolicy(RemovalPolicy.RETAIN);
    this.addOutput(
      this,
      'CmsFrontendUserPoolClientId',
      frontendUserPoolClient.ref,
    );
    const backendUserPoolClient = new cognito.CfnUserPoolClient(
      this,
      'CmsBackendUserPoolClient',
      {
        userPoolId: userPool.ref,
        clientName: `cms-${this.resourcePrefix}-userpoolclient-backend`,
        explicitAuthFlows: [
          'ALLOW_ADMIN_USER_PASSWORD_AUTH',
          'ALLOW_REFRESH_TOKEN_AUTH',
        ],
        preventUserExistenceErrors: 'ENABLED',
        generateSecret: false,
      },
    );
    backendUserPoolClient.applyRemovalPolicy(RemovalPolicy.RETAIN);
    this.addOutput(
      this,
      'CmsBackendUserPoolClientId',
      backendUserPoolClient.ref,
    );
    return userPool;
  }

  private addQueue(name: string) {
    const queue = new sqs.Queue(this, `${name}Queue`, {
      queueName: `${this.resourcePrefix}-${_.kebabCase(name)}`,
      encryption: sqs.QueueEncryption.KMS_MANAGED,
    });

    this.addOutput(this, `${name}QueueArn`, queue.queueArn);
    this.addOutput(this, `${name}QueueName`, queue.queueName);
    this.addOutput(this, `${name}QueueUrl`, queue.queueUrl);

    return queue;
  }
}
