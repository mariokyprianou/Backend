import { Request, Response } from 'express';
import { ExecutionParams } from 'graphql-tools';
import acceptLanguage from 'accept-language';
import { AuthContext } from '@lib/power/types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { findAccountByCognitoSub } from '@lib/power/account/findAccountIdBySub';
import { Account } from '@lib/power';

export interface AppContext {
  user: User;
}

export interface User {
  id: string;
  sub: string;
  language: string;
}

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const context = GqlExecutionContext.create(ctx);
    return context.getContext<AppContext>().user;
  },
);

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
}: ExpressContext): Promise<GQLContext & AppContext> {
  const language = acceptLanguage.get(req.headers['accept-language'] ?? 'en');

  // GQL Playground workaround
  if (req.method === 'GET') {
    return { language } as any;
  }

  const sub = req?.apiGateway?.event?.requestContext?.authorizer?.claims?.sub;
  let account: Account | null = null;
  if (sub) {
    account = await findAccountByCognitoSub(sub);
  }

  return {
    ipAddress: req?.apiGateway?.event?.headers?.['X-Forwarded-For'],
    language,
    authContext: {
      id: account?.id,
      sub,
    },
    user: {
      id: account?.id,
      sub,
      language,
    },
  };
}
