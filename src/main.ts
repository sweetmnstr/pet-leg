import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      const whitelist = process.env.CORS_WHITELIST || '';

      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS Error'));
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  await app.listen(8899);
}
bootstrap();
