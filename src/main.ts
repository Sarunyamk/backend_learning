import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalValidationPipe } from './common/pipes/global-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(new GlobalValidationPipe());

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Template Title')
      .setDescription('Template Description')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer' })
      .addServer(`http://localhost:${process.env.API_PORT ?? 4000}`)
      .build();
    SwaggerModule.setup(
      'api-docs',
      app,
      SwaggerModule.createDocument(app, config),
    );
  }

  const port = process.env.API_PORT ?? 4000;
  const logger = new Logger('Bootstrap');
  await app.listen(port);
  logger.log(`Running on http://localhost:${port}/api`);
  logger.log(`Swagger at http://localhost:${port}/api-docs`);
}
void bootstrap();
