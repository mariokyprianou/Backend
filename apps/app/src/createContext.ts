import { Request, Response } from 'express';
import { ExecutionParams } from 'graphql-tools';
import acceptLanguage from 'accept-language';

acceptLanguage.languages(['en', 'ur', 'hi']);

export interface GQLContext {
  language: string;
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

  return {
    language: acceptLanguage.get(req.headers['accept-language'] ?? 'en'),
  };
}
