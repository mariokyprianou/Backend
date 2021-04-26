import { SubscriptionPlatform } from '@td/subscriptions';
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { SQS } from 'aws-sdk';

const sqs = new SQS();

const handler: APIGatewayProxyHandlerV2<void> = async (event, context) => {
  console.log('webhook', JSON.stringify(event));

  // This request is pre-validated using an httpApi authorizer. We can safely push the
  // event straight into the processing queue.
  try {
    await sqs
      .sendMessage({
        QueueUrl: process.env.WEBHOOK_QUEUE_URL,
        MessageBody: JSON.stringify({
          provider: SubscriptionPlatform.GooglePlay,
          body: JSON.parse(event.body),
        }),
      })
      .promise();
    return { statusCode: 200 };
  } catch (e) {
    return { statusCode: 500 };
  }
};

export default handler;
