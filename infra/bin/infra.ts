#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { InfraStack, InfraStackProps } from '../lib/infra-stack';
import * as packageJson from '../../package.json';
import { DeploymentStage } from '../lib/interface';
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  Peer,
} from '@aws-cdk/aws-ec2';

const app = new cdk.App();

const baseConfig: Pick<InfraStackProps, 'project'> &
  Partial<InfraStackProps> = {
  project: packageJson.name,
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-south-1',
  },
  vpc: {
    natGateways: 1,
    maxAzs: 3,
    allowAccessFrom: [
      Peer.ipv4('92.21.103.3/32'), // MJ Home
      Peer.ipv4('188.65.101.202/32'), // The Distance Office
    ],
  },
  database: {},
  userPool: {},
  cmsUserPool: {},
};

const devConfig: InfraStackProps = {
  ...baseConfig,
  stage: DeploymentStage.DEVELOPMENT,
  database: {
    snapshotIdentifier:
      'power-dev-infra-snapshot-postgres9dc8bb04-sij935jkzz0v',
  },
};

const qaConfig: InfraStackProps = {
  ...baseConfig,
  stage: DeploymentStage.QA,
};

const uatConfig: InfraStackProps = {
  ...baseConfig,
  stage: DeploymentStage.UAT,
};

const productionConfig: InfraStackProps = {
  ...baseConfig,
  stage: DeploymentStage.PRODUCTION,
  database: {
    instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
    createRdsProxy: false,
  },
  userDatabase: {
    instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
    createRdsProxy: false,
  },
};

function createStack(props: InfraStackProps) {
  props = {
    stackName: `${props.project}-${props.stage}-infra`,
    ...props,
  };

  // StackId does not depend on project name to simplify scripting
  const stackId = `${props.stage}-infra`;

  return new InfraStack(app, stackId, props);
}

createStack(devConfig);
createStack(qaConfig);
createStack(uatConfig);
createStack(productionConfig);
