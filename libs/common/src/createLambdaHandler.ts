import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { Express } from 'express';
import { Server } from 'http';
import { Context } from 'aws-lambda';
import { createServer, proxy, Response } from 'aws-serverless-express';
import { eventContext } from 'aws-serverless-express/middleware';

import * as helmet from 'helmet';

export async function createApp(
  expressApp: Express,
  module: any,
): Promise<INestApplication> {
  return await NestFactory.create(module, new ExpressAdapter(expressApp));
}

async function bootstrap(module: any): Promise<Server> {
  const expressApp = express();

  const app = await createApp(expressApp, module);
  app.useGlobalPipes(new ValidationPipe());

  app.use(eventContext());
  app.use(helmet());

  await app.init();
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'https://7dljjjdaud.execute-api.ap-south-1.amazonaws.com/cms',
    ],
  });

  return createServer(expressApp);
}

export default function createHandler(module: any) {
  let cachedServer: Server;

  return async function handler(
    event: any,
    context: Context,
  ): Promise<Response> {
    if (!cachedServer) {
      cachedServer = await bootstrap(module);
    }
    return proxy(cachedServer, event, context, 'PROMISE').promise;
  };
}
