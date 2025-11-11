import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { configDotenv } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';

configDotenv({ quiet: true });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'debug', 'warn', 'fatal'],
  });

  //MVC
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.useStaticAssets(join(__dirname, '..', 'public'));

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
    }),
  );

  //listen to port
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
