import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { SQS } from 'aws-sdk';

const sqs = new SQS();

const providers = {
  googleplay: {
    verify: () => true,
  },
  appstore: {
    verify: () => true,
  },
};

const handler: APIGatewayProxyHandlerV2<void> = async (event, context) => {
  console.log(
    'webhook',
    event.pathParameters?.provider,
    event.pathParameters?.name,
    JSON.stringify(event),
  );

  const provider = providers[event.pathParameters?.provider];
  if (!provider) {
    return { statusCode: 400 };
  }

  if (!provider.verify(event.pathParameters?.name, event)) {
    return { statusCode: 400 };
  }

  try {
    await sqs
      .sendMessage({
        QueueUrl: process.env.WEBHOOK_QUEUE_URL,
        MessageBody: JSON.stringify({
          provider: event.pathParameters?.provider,
          name: event.pathParameters?.name,
          body: event.body,
        }),
      })
      .promise();
    return { statusCode: 200 };
  } catch (e) {
    return { statusCode: 500 };
  }
};

export default handler;
