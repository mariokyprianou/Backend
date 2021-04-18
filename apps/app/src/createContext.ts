import { Request, Response } from 'express';
import { ExecutionParams } from 'graphql-tools';
import acceptLanguage from 'accept-language';
import { AuthContext } from '@lib/power/types';
import { findAccountByCognitoSub } from '@lib/power/account/findAccountIdBySub';
import { Account } from '@lib/power';

acceptLanguage.languages(['en', 'ur', 'hi']);

export interface GQLContext {
  ipAddress?: string;
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
  // GQL Playground workaround
  if (req.method === 'GET') {
    return {
      language: acceptLanguage.get(req.headers['accept-language'] ?? 'en'),
    };
  }

  const sub = req?.apiGateway?.event?.requestContext?.authorizer?.claims?.sub;
  let account: Account | null = null;
  if (sub) {
    account = await findAccountByCognitoSub(sub);
  }

  return {
    ipAddress: req?.apiGateway?.event?.headers?.['X-Forwarded-For'],
    language: acceptLanguage.get(req.headers['accept-language'] ?? 'en'),
    authContext: {
      id: account?.id,
      sub,
    },
  };
}
