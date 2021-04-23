import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ExpressContext } from 'apollo-server-express';

export interface CmsContext {
  user: CmsUser;
}

export interface CmsUser {
  sub: string;
}

export const CmsUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const context = GqlExecutionContext.create(ctx);
    return context.getContext<CmsContext>().user;
  },
);

export const createContext = (ctx: ExpressContext): CmsContext => {
  return {
    user: {
      sub: ctx.req?.apiGateway?.event?.requestContext?.authorizer?.claims?.sub,
    },
  };
};
