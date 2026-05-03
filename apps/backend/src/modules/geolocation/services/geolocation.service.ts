// ==========================================================================
// Geolocation Service - Gestión de geocercas y ubicaciones
// ==========================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import {
  CreateGeoFenceDto,
  UpdateGeoFenceDto,
  VerifyLocationDto,
} from '../dto/geolocation.dto';
import { buildPaginationMeta, getPaginationArgs } from '../../../shared/utils/pagination.util';

// Haversine distance calculation
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Injectable()
export class GeolocationService {
  private readonly logger = new Logger(GeolocationService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // ─── CRUD GEOFENCES ────────────────────────────────────────────────────

  async findAll(tenantId: string, page: number = 1, limit: number = 20) {
    const [fences, total] = await Promise.all([
      this.prisma.geoFence.findMany({
        where: { tenantId },
        ...getPaginationArgs(page, limit),
        orderBy: { createdAt: 'desc' },
        include: {
          workSchedule: {
            select: { id: true, name: true },
          },
          _count: {
            select: { workSchedules: true },
          },
        },
      }),
      this.prisma.geoFence.count({ where: { tenantId } }),
    ]);

    return buildPaginationMeta(fences, total, page, limit);
  }

  async findOne(tenantId: string, id: string) {
    const fence = await this.prisma.geoFence.findFirst({
      where: { id, tenantId },
      include: {
        workSchedule: {
          select: { id: true, name: true },
        },
        workSchedules: {
          select: { id: true, name: true, isDefault: true },
        },
      },
    });

    if (!fence) {
      throw new NotFoundException('Geocerca no encontrada');
    }

    return fence;
  }

  async create(tenantId: string, dto: CreateGeoFenceDto, userId: string) {
    // Verificar nombre único
    const existing = await this.prisma.geoFence.findFirst({
      where: { tenantId, name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Ya existe una geocerca con nombre "${dto.name}"`);
    }

    const fence = await this.prisma.geoFence.create({
      data: {
        tenantId,
        name: dto.name,
        latitude: dto.latitude,
        longitude: dto.longitude,
        radius: dto.radius,
        color: dto.color || '#3B82F6',
        address: dto.address || null,
        workScheduleId: dto.workScheduleId || null,
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'CREATE',
      entity: 'geofence',
      entityId: fence.id,
      description: `Geocerca creada: ${fence.name} (${fence.radius}m)`,
      newValue: { name: dto.name, radius: dto.radius, address: dto.address },
    });

    return fence;
  }

  async update(tenantId: string, id: string, dto: UpdateGeoFenceDto, userId: string) {
    const fence = await this.prisma.geoFence.findFirst({
      where: { id, tenantId },
    });
    if (!fence) throw new NotFoundException('Geocerca no encontrada');

    const oldValue = { name: fence.name, radius: fence.radius };

    const updated = await this.prisma.geoFence.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
        ...(dto.radius !== undefined && { radius: dto.radius }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.workScheduleId !== undefined && { workScheduleId: dto.workScheduleId }),
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'UPDATE',
      entity: 'geofence',
      entityId: id,
      description: `Geocerca actualizada: ${updated.name}`,
      oldValue,
      newValue: { name: updated.name, radius: updated.radius },
    });

    return updated;
  }

  async delete(tenantId: string, id: string, userId: string) {
    const fence = await this.prisma.geoFence.findFirst({
      where: { id, tenantId },
    });
    if (!fence) throw new NotFoundException('Geocerca no encontrada');

    // Verificar que no esté asociada a horarios
    const schedulesCount = await this.prisma.workSchedule.count({
      where: { geoFenceId: id },
    });
    if (schedulesCount > 0) {
      throw new ConflictException(
        `No se puede eliminar: está asociada a ${schedulesCount} horario(s) laboral(es)`,
      );
    }

    await this.prisma.geoFence.delete({ where: { id } });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'DELETE',
      entity: 'geofence',
      entityId: id,
      description: `Geocerca eliminada: ${fence.name}`,
      oldValue: { name: fence.name, radius: fence.radius },
    });

    return { message: 'Geocerca eliminada exitosamente' };
  }

  // ─── VERIFICACIÓN DE UBICACIÓN ─────────────────────────────────────────

  async verifyLocation(tenantId: string, dto: VerifyLocationDto) {
    let fences;

    if (dto.geoFenceId) {
      const fence = await this.prisma.geoFence.findFirst({
        where: { id: dto.geoFenceId, tenantId },
      });
      if (!fence) throw new NotFoundException('Geocerca no encontrada');
      fences = [fence];
    } else if (dto.employeeId) {
      // Buscar geocerca del horario del empleado
      const employee = await this.prisma.employee.findFirst({
        where: { id: dto.employeeId, tenantId, status: 'ACTIVE' },
        include: {
          workSchedule: {
            include: { geoFence: true },
          },
        },
      });
      if (!employee?.workSchedule?.geoFence) {
        return {
          verified: false,
          inside: false,
          message: 'El empleado no tiene una geocerca asignada',
          nearestFence: null,
        };
      }
      fences = [employee.workSchedule.geoFence];
    } else {
      // Buscar todas las geocercas del tenant
      fences = await this.prisma.geoFence.findMany({ where: { tenantId } });
    }

    const results = fences.map((fence) => {
      const distance = haversineDistance(
        dto.latitude, dto.longitude,
        fence.latitude, fence.longitude,
      );
      return {
        id: fence.id,
        name: fence.name,
        distance: Math.round(distance * 100) / 100,
        inside: distance <= fence.radius,
        radius: fence.radius,
        center: { latitude: fence.latitude, longitude: fence.longitude },
      };
    });

    const insideAny = results.some((r) => r.inside);
    const nearestFence = results.reduce((min, r) =>
      r.distance < min.distance ? r : min, results[0],
    );

    return {
      verified: insideAny,
      inside: insideAny,
      timestamp: new Date(),
      location: { latitude: dto.latitude, longitude: dto.longitude },
      results,
      nearestFence: nearestFence || null,
      message: insideAny
        ? 'Ubicación verificada - dentro del área permitida'
        : `Fuera del área permitida. Distancia a la geocerca más cercana: ${Math.round(nearestFence?.distance || 0)}m`,
    };
  }
}
