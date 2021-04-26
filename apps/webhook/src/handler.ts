import type { SQSHandler } from 'aws-lambda';
import { NestApplication, NestFactory } from '@nestjs/core';
import { WebhookProcessingModule } from './webhooks.module';
import {
  GooglePlayNotification,
  GooglePlayNotificationsService,
  GooglePubSubPayload,
  SubscriptionPlatform,
} from '@td/subscriptions';

let app: NestApplication = null;

const handler: SQSHandler = async (event) => {
  console.log('webhook', JSON.stringify(event));

  if (!app) {
    app = await NestFactory.create(WebhookProcessingModule);
  }

  const jobs = event.Records.map(async (record) => {
    const message: { provider: string; body: any } = JSON.parse(record.body);

    if (message.provider === SubscriptionPlatform.GooglePlay) {
      const payload = message.body as GooglePubSubPayload;
      const json = Buffer.from(payload.message.data, 'base64').toString(
        'utf-8',
      );
      const notification: GooglePlayNotification = JSON.parse(json);
      console.log('google-play.notification', json);
      const service = app.get(GooglePlayNotificationsService);
      await service.handleRealtimeNotification(notification);
    }
  });

  await Promise.all(jobs);
};

export default handler;
