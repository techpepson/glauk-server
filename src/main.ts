import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { configDotenv } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';

configDotenv({ quiet: true });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {});

  //MVC
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.enableCors({
    origin: [
      'https://google.com',
      'http://localhost:4000',
      'http://localhost:3000',
      '*',
    ],
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  //helmet for security
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [
            `'self'`,
            'data:',
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [
            `'self'`,
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
        },
      },
    }),
  );

  //enable cors
  app.enableCors();

  //set global prefix
  app.setGlobalPrefix('api');

  //validator
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true, //this allows nest to automatically convert types
      },
    }),
  );

  //listen to port
  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
