import { SSM } from 'aws-sdk';
import * as _ from 'lodash';
import * as DataLoader from 'dataloader';
import {} from 'google-auth-library';

interface SSMConfig {
  cloudfront: {
    keypairId: string;
    privateKey: string;
    url: string;
  };
  //   googlePlay: {
  //     serviceAccount: {
  //       project_id: string;
  //       client_id: string;
  //       client_email: string;
  //       private_key: string;
  //     };
  //   };
}

const configLoader = new DataLoader<string, SSMConfig>(
  async ([stage]) => {
    const prefix = `/power/${stage}/`;
    const response = await new SSM()
      .getParametersByPath({
        Path: prefix,
        Recursive: true,
        WithDecryption: true,
      })
      .promise();

    const config = response.Parameters.reduce<any>((acc, param) => {
      const name = param.Name.substring(prefix.length)
        .split('/')
        .map(_.camelCase)
        .join('.');

      let value = param.Value?.trim();
      if (value?.startsWith('{') && value?.endsWith('}')) {
        value = JSON.parse(param.Value);
      }
      _.set(acc, name, value);
      return acc;
    }, {});

    return [config];
  },
  { batch: false },
);

export const getSSMConfig = async (stage: string) => {
  return configLoader.load(stage);
};
