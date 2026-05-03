// ==========================================================================
// Health Controller - Endpoints de health checks
// ==========================================================================

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from '../services/health.service';
import { Public } from '../../../shared/decorators/public.decorator';

@ApiTags('Health')
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check completo del sistema' })
  async check() {
    return this.healthService.check();
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe (K8s)' })
  async liveness() {
    return this.healthService.checkLiveness();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe (K8s)' })
  async readiness() {
    return this.healthService.checkReadiness();
  }
}
