import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';
import { CfnOutput, Duration } from '@aws-cdk/core';
import { DeploymentStage } from './interface';

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

export interface InfraStackProps extends cdk.StackProps {
  project: string;
  stage: DeploymentStage;
  vpc?: InfraStackPropsVpcConfig;
  database?: InfraStackDatabaseConfig;
}

export class InfraStack extends cdk.Stack {
  public readonly stage: DeploymentStage;
  public readonly resourcePrefix: string;
  public readonly vpc?: ec2.Vpc;
  public readonly database?: rds.DatabaseInstance;

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
      maxAzs: config.maxAzs ?? 1,
      natGateways: config.natGateways,
      natGatewayProvider: natProvider,
    });

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
      vpcSubnets: {},
    });
    // securityGroups.forEach((sg) => {
    //   instance.connections.allowFrom(sg, ec2.Port.tcp(5432));
    // });

    this.addOutput(this, `${dbName}Host`, instance.instanceEndpoint.hostname);
    this.addOutput(
      this,
      `${dbName}Address`,
      instance.instanceEndpoint.socketAddress,
    );
    this.addOutput(this, `${dbName}SecretArn`, instance.secret!.secretArn);

    return instance;
  }
}
