import { createLambdaHandler } from '@lib/common';
import { AppModule } from './app.module';

const handler = createLambdaHandler(AppModule);

export default handler;
