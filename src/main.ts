import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter, ResponseInterceptor } from './interceptor';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Fingerprint = require('express-fingerprint');

function configureSwagger(app): void {
  const config = new DocumentBuilder()
    .setTitle('AutoTools.IO - Gateway DOCS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  /** check if there is Public decorator for each path (action) and its method (findMany / findOne) on each controller */
  Object.values((document as OpenAPIObject).paths).forEach((path: any) => {
    Object.values(path).forEach((method: any) => {
      if (
        Array.isArray(method.security) &&
        method.security.includes('isPublic')
      ) {
        method.security = [];
      }
    });
  });
  SwaggerModule.setup('/api/docs', app, document);
}

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(express()),
    {
      bufferLogs: true,
      cors: true,
    },
  );
  app.setGlobalPrefix('/api');
  app.use(helmet());
  const configService = app.get(ConfigService);
  const moduleRef = app.select(AppModule);
  const reflector = moduleRef.get(Reflector);
  app.useGlobalInterceptors(
    new ResponseInterceptor(reflector),
    new ClassSerializerInterceptor(reflector),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );
  app.use(
    Fingerprint({
      parameters: [
        Fingerprint.useragent,
        Fingerprint.acceptHeaders,
        Fingerprint.geoip,
      ],
    }),
  );

  configureSwagger(app);

  await app.listen(configService.get('PORT'));
  logger.log(
    `🚀 Auth service started successfully on port ${configService.get('PORT')}`,
  );
}
bootstrap();
