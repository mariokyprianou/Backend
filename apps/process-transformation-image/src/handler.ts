import type { S3Event, SQSHandler } from 'aws-lambda';
import { NestApplication, NestFactory } from '@nestjs/core';
import { TransformationImageLambdaModule } from './transformation-image-module';
import { TransformationImageService } from '@lib/power';

let app: NestApplication = null;

// Matches transformations/{accountId}/{date}.{jpg}
const REGEX = /^transformations\/(\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b)\/(\d{4}\-(?:0?[1-9]|1[012])\-(?:0?[1-9]|[12][0-9]|3[01]))\.([a-zA-Z0-9]+)$/;

const handler: SQSHandler = async (event) => {
  console.log(JSON.stringify({ event }, null, 2));
  if (!app) {
    app = await NestFactory.create(TransformationImageLambdaModule);
  }

  const service = app.get(TransformationImageService);
  await Promise.all(
    event.Records.map(async (record) => {
      const data: S3Event = JSON.parse(record.body);

      for (const record of data.Records) {
        const key = record.s3.object.key;
        const match = key.match(REGEX);
        if (match) {
          console.log('image updated', record.s3.object.key);
          await service.onImageUploaded({
            accountId: match[1],
            imageKey: key,
            date: match[2],
          });
        }
      }
    }),
  );
};

export default handler;
