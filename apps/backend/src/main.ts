// ==========================================================================
// Main - Entry point de la aplicación
// ==========================================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3001);
  const env = configService.get<string>('app.env', 'development');
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');

  // ─── SEGURIDAD ──────────────────────────────────────────────────────────

  // Helmet - Headers de seguridad
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https:'],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // CORS
  app.enableCors({
    origin: configService.get<string[]>('app.cors.origin', [
      'http://localhost:3000',
    ]),
    credentials: configService.get<boolean>('app.cors.credentials', true),
    methods: configService.get<string[]>('app.cors.methods', [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ]),
    allowedHeaders: configService.get<string[]>('app.cors.allowedHeaders', [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Tenant-Id',
    ]),
  });

  // Compresión
  app.use(compression());

  // Cookie parser
  app.use(cookieParser());

  // ─── CONFIGURACIÓN DE LA API ────────────────────────────────────────────

  // Prefijo global
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health', 'health/ready'],
  });

  // Versionado
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Validación global con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no decoradas
      forbidNonWhitelisted: true, // Error si envía propiedades no esperadas
      transform: true, // Transforma tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: 422,
    }),
  );

  // ─── SWAGGER DOCUMENTATION ─────────────────────────────────────────────

  if (env !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Asistencia SaaS API')
      .setDescription('API REST para control de asistencia y gestión de personal multi-tenant')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Ingrese su access token JWT',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Auth', 'Autenticación y registro')
      .addTag('Tenant', 'Gestión de empresa')
      .addTag('Users', 'Gestión de usuarios del sistema')
      .addTag('Employees', 'Gestión de empleados')
      .addTag('Attendance', 'Control de asistencia')
      .addTag('Projects', 'Gestión de proyectos')
      .addTag('Reports', 'Reportes y exportaciones')
      .addTag('Geolocation', 'Geolocalización y geocercas')
      .addTag('Overtime', 'Horas extra')
      .addTag('Audit', 'Auditoría y logs')
      .addTag('Health', 'Health check')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    logger.log(`📄 Swagger disponible en http://localhost:${port}/docs`);
  }

  // ─── START ──────────────────────────────────────────────────────────────

  await app.listen(port);
  logger.log(`🚀 Asistencia SaaS API corriendo en http://localhost:${port}`);
  logger.log(`📋 Prefijo API: /${apiPrefix}`);
  logger.log(`🌍 Entorno: ${env}`);
}

bootstrap();
