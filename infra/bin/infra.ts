#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { InfraStack, InfraStackProps } from '../lib/infra-stack';
import * as packageJson from '../../package.json';
import { DeploymentStage } from '../lib/interface';

const app = new cdk.App();

const baseConfig: Pick<InfraStackProps, 'project'> &
  Partial<InfraStackProps> = {
  project: packageJson.name,
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-south-1',
  },
  vpc: {
    natGateways: 0,
    maxAzs: 3
  },
  database: {},
  userPool: {},
  cmsUserPool: {},
};

const devConfig: InfraStackProps = {
  ...baseConfig,
  stage: DeploymentStage.DEVELOPMENT,
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
  stackName: 'prod',
  stage: DeploymentStage.PRODUCTION,
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
