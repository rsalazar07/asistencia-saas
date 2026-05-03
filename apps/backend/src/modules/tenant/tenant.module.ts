// ==========================================================================
// Tenant Module - Gestión de empresas
// ==========================================================================

import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TenantController } from './controllers/tenant.controller';
import { TenantService } from './services/tenant.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    MulterModule.register({
      dest: './uploads/logos',
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  ],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
