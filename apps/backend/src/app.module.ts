// ==========================================================================
// App Module - Módulo raíz de la aplicación
// ==========================================================================

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Configuración
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import redisConfig from './config/redis.config';

// Módulos globales
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './modules/audit/audit.module';

// Módulos de dominio
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ProjectModule } from './modules/project/project.module';
import { ReportModule } from './modules/report/report.module';
import { GeolocationModule } from './modules/geolocation/geolocation.module';
import { OvertimeModule } from './modules/overtime/overtime.module';
import { HealthModule } from './modules/health/health.module';

// Shared
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { TenantGuard } from './shared/guards/tenant.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './shared/interceptors/timeout.interceptor';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, redisConfig],
      envFilePath: '.env',
    }),

    // Rate limiting global
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('auth.throttling.global.windowMs', 60000),
          limit: config.get<number>('auth.throttling.global.max', 100),
        },
      ],
    }),

    // Tareas programadas
    ScheduleModule.forRoot(),

    // Módulos globales
    PrismaModule,
    AuditModule,

    // Módulos de dominio
    AuthModule,
    TenantModule,
    EmployeeModule,
    AttendanceModule,
    ProjectModule,
    ReportModule,
    GeolocationModule,
    OvertimeModule,
    HealthModule,
  ],
  providers: [
    // Guards globales
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // Interceptors globales
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },

    // Filtros globales
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
