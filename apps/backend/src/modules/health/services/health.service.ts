// ==========================================================================
// Health Service - Health checks del sistema
// ==========================================================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private startTime = Date.now();

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async check() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      services: {} as Record<string, { status: string; latency?: number; error?: string }>,
    };

    // Database check
    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      checks.services.database = {
        status: 'up',
        latency: Date.now() - dbStart,
      };
    } catch (error: any) {
      checks.services.database = {
        status: 'down',
        error: error.message,
      };
      checks.status = 'degraded';
    }

    // Memory check
    const memoryUsage = process.memoryUsage();
    checks.services.memory = {
      status: 'up',
      details: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100 + ' MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100 + ' MB',
        rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100 + ' MB',
      },
    };

    // App info
    checks.services.app = {
      status: 'up',
      details: {
        nodeVersion: process.version,
        environment: this.configService.get('app.environment', 'development'),
        version: this.configService.get('app.apiVersion', '1.0'),
        timezone: 'America/Lima',
      },
    };

    return checks;
  }

  async checkLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  async checkReadiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch {
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      };
    }
  }
}
