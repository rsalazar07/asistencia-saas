// ==========================================================================
// Overtime Module - Horas extra
// ==========================================================================

import { Module } from '@nestjs/common';
import { OvertimeController } from './controllers/overtime.controller';
import { OvertimeService } from './services/overtime.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [OvertimeController],
  providers: [OvertimeService],
  exports: [OvertimeService],
})
export class OvertimeModule {}
