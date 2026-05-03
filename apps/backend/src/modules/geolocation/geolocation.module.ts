// ==========================================================================
// Geolocation Module - Geocercas y verificación de ubicación
// ==========================================================================

import { Module } from '@nestjs/common';
import { GeolocationController } from './controllers/geolocation.controller';
import { GeolocationService } from './services/geolocation.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [GeolocationController],
  providers: [GeolocationService],
  exports: [GeolocationService],
})
export class GeolocationModule {}
