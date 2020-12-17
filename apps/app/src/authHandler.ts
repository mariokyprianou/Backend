import { createLambdaHandler } from '@lib/common';
import { AuthModule } from './auth.module';

const handler = createLambdaHandler(AuthModule);

export default handler;
