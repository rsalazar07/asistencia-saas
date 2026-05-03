// ==========================================================================
// Audit Service - Registro de auditoría
// ==========================================================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

export interface AuditLogEntry {
  tenantId: string;
  userId?: string;
  action: AuditAction | string;
  entity: string;
  entityId?: string;
  description?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: entry.tenantId,
          userId: entry.userId || null,
          action: entry.action as AuditAction,
          entity: entry.entity,
          entityId: entry.entityId || null,
          description: entry.description || null,
          oldValue: entry.oldValue || undefined,
          newValue: entry.newValue || undefined,
          ipAddress: entry.ipAddress || null,
          userAgent: entry.userAgent || null,
        },
      });
    } catch (error) {
      // No lanzar error si falla el audit log - no debe romper la operación principal
      this.logger.error(`Error al guardar audit log: ${error.message}`);
    }
  }
}
