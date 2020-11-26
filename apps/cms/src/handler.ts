import { createLambdaHandler } from '@lib/common';
import { CmsModule } from './cms.module';

const handler = createLambdaHandler(CmsModule);

export default handler;
