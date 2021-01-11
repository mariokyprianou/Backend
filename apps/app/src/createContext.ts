import { Request, Response } from 'express';
import { ExecutionParams } from 'graphql-tools';
import acceptLanguage from 'accept-language';
import * as R from 'ramda';
import { AuthContext } from '@lib/power/types';

acceptLanguage.languages(['en', 'ur', 'hi']);

export interface GQLContext {
  language: string;
  authContext?: AuthContext;
}
interface ExpressContext {
  req: Request;
  res: Response;
  connection?: ExecutionParams;
}

export async function createContext({
  req,
}: ExpressContext): Promise<GQLContext> {
  console.log(req.headers);
  // GQL Playground workaround
  if (req.method === 'GET') {
    return {
      language: acceptLanguage.get(req.headers['accept-language'] ?? 'en'),
    };
  }

  return {
    language: acceptLanguage.get(req.headers['accept-language'] ?? 'en'),
    authContext: {
      sub: R.path(
        [
          'apiGateway',
          'event',
          'requestContext',
          'authorizer',
          'claims',
          'sub',
        ],
        req,
      ),
    },
  };
}
