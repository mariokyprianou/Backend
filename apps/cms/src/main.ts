import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CmsModule } from './cms.module';

// Entry point for nest cli
async function bootstrap() {
  const app = await NestFactory.create(CmsModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
