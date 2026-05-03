// ==========================================================================
// Auth Service - Lógica de negocio de autenticación
// ==========================================================================

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { AuditService } from '../audit/services/audit.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly MAX_SESSIONS: number;
  private readonly ACCESS_TOKEN_EXPIRES: string;
  private readonly REFRESH_TOKEN_EXPIRES_DAYS: number;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {
    this.MAX_SESSIONS = this.configService.get<number>(
      'auth.session.maxDevices',
      5,
    );
    this.ACCESS_TOKEN_EXPIRES = this.configService.get<string>(
      'auth.jwt.accessToken.expiresIn',
      '15m',
    );
    this.REFRESH_TOKEN_EXPIRES_DAYS = 7;
  }

  // ─── REGISTRO ────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    this.logger.log(`Registrando nueva empresa: ${dto.companyName}`);

    // Verificar email no existente
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.adminEmail },
    });

    if (existingUser) {
      throw new ConflictException(
        'El email ya está registrado en el sistema',
      );
    }

    // Hash de contraseña
    const saltRounds = this.configService.get<number>(
      'auth.bcrypt.saltRounds',
      12,
    );
    const passwordHash = await bcrypt.hash(dto.adminPassword, saltRounds);

    // Crear tenant, usuario y horario default en transacción
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Crear tenant
      const tenant = await tx.tenant.create({
        data: {
          name: dto.companyName,
          legalName: dto.legalName || dto.companyName,
          rut: dto.rut || null,
          email: dto.adminEmail,
          phone: dto.phone || null,
          timezone: dto.timezone || 'America/Lima',
          status: 'TRIAL',
          maxEmployees: 50,
          maxProjects: 20,
          config: {
            requirePhoto: false,
            requireGps: true,
            geofenceRadius: 100,
          },
        },
      });

      // 2. Crear horario default
      const workSchedule = await tx.workSchedule.create({
        data: {
          tenantId: tenant.id,
          name: 'Horario Oficina',
          description: 'Lunes a Viernes 8am - 5pm',
          isDefault: true,
          details: {
            create: [
              {
                dayOfWeek: 1,
                startTime: '08:00',
                endTime: '17:00',
                breakStart: '12:00',
                breakEnd: '13:00',
                graceMinutes: 15,
              },
              {
                dayOfWeek: 2,
                startTime: '08:00',
                endTime: '17:00',
                breakStart: '12:00',
                breakEnd: '13:00',
                graceMinutes: 15,
              },
              {
                dayOfWeek: 3,
                startTime: '08:00',
                endTime: '17:00',
                breakStart: '12:00',
                breakEnd: '13:00',
                graceMinutes: 15,
              },
              {
                dayOfWeek: 4,
                startTime: '08:00',
                endTime: '17:00',
                breakStart: '12:00',
                breakEnd: '13:00',
                graceMinutes: 15,
              },
              {
                dayOfWeek: 5,
                startTime: '08:00',
                endTime: '17:00',
                breakStart: '12:00',
                breakEnd: '13:00',
                graceMinutes: 15,
              },
              {
                dayOfWeek: 6,
                startTime: '09:00',
                endTime: '13:00',
                isWorkingDay: false,
              },
              {
                dayOfWeek: 0,
                startTime: '00:00',
                endTime: '00:00',
                isWorkingDay: false,
              },
            ],
          },
        },
      });

      // 3. Crear usuario admin
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.adminEmail,
          passwordHash,
          firstName: dto.adminFirstName,
          lastName: dto.adminLastName,
          role: 'TENANT_ADMIN',
          isActive: true,
        },
      });

      return { tenant, user, workSchedule };
    });

    // 4. Generar tokens
    const tokens = await this.generateTokens(
      result.user.id,
      result.user.email,
      result.tenant.id,
      result.tenant.name,
      'TENANT_ADMIN',
    );

    // 5. Audit log
    await this.auditService.log({
      tenantId: result.tenant.id,
      userId: result.user.id,
      action: 'CREATE',
      entity: 'tenant',
      description: `Registro de nueva empresa: ${result.tenant.name}`,
      newValue: { companyName: dto.companyName, email: dto.adminEmail },
      ipAddress: null,
      userAgent: null,
    });

    this.logger.log(`Empresa registrada: ${result.tenant.name}`);

    return {
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
      },
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
      ...tokens,
    };
  }

  // ─── LOGIN ───────────────────────────────────────────────────────────────

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    this.logger.log(`Login intent: ${dto.email}`);

    // 1. Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            status: true,
            logoUrl: true,
            timezone: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Verificar tenant activo
    if (user.tenant.status !== 'ACTIVE' && user.tenant.status !== 'TRIAL') {
      throw new UnauthorizedException(
        'La empresa no está activa. Contacte al administrador.',
      );
    }

    // 3. Verificar usuario activo
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Usuario desactivado. Contacte al administrador.',
      );
    }

    // 4. Verificar contraseña
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      // Audit log de intento fallido
      await this.auditService.log({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'LOGIN',
        entity: 'user',
        description: `Intento de login fallido para: ${dto.email}`,
        newValue: { success: false, reason: 'Contraseña incorrecta' },
        ipAddress,
        userAgent,
      });

      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 5. Limitar sesiones simultáneas
    await this.limitSessions(user.id);

    // 6. Generar tokens
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.tenant.id,
      user.tenant.name,
      user.role,
    );

    // 7. Actualizar lastLoginAt
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 8. Audit log de login exitoso
    await this.auditService.log({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'LOGIN',
      entity: 'user',
      description: `Login exitoso: ${user.email}`,
      newValue: { success: true },
      ipAddress,
      userAgent,
    });

    this.logger.log(`Login exitoso: ${user.email}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 900, // 15 minutos en segundos
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenant.id,
        tenantName: user.tenant.name,
        logoUrl: user.tenant.logoUrl,
      },
    };
  }

  // ─── REFRESH TOKEN ───────────────────────────────────────────────────────

  async refreshTokens(refreshToken: string) {
    this.logger.log('Refresh token request');

    // 1. Buscar sesión
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
      include: {
        user: {
          include: {
            tenant: {
              select: { id: true, name: true, status: true },
            },
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    if (session.isRevoked) {
      throw new UnauthorizedException('Sesión ya cerrada');
    }

    if (new Date() > session.expiresAt) {
      throw new UnauthorizedException('Refresh token expirado');
    }

    // 2. Revocar sesión actual
    await this.prisma.session.update({
      where: { id: session.id },
      data: { isRevoked: true },
    });

    // 3. Generar nuevos tokens
    const tokens = await this.generateTokens(
      session.user.id,
      session.user.email,
      session.user.tenant.id,
      session.user.tenant.name,
      session.user.role,
    );

    this.logger.log(`Tokens renovados para: ${session.user.email}`);

    return tokens;
  }

  // ─── LOGOUT ──────────────────────────────────────────────────────────────

  async logout(refreshToken: string, userId: string) {
    this.logger.log(`Logout: ${userId}`);

    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
    });

    if (session) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { isRevoked: true },
      });

      // Audit log
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true, email: true },
      });

      if (user) {
        await this.auditService.log({
          tenantId: user.tenantId,
          userId,
          action: 'LOGOUT',
          entity: 'user',
          description: `Logout: ${user.email}`,
          ipAddress: null,
          userAgent: null,
        });
      }
    }

    return { message: 'Sesión cerrada exitosamente' };
  }

  // ─── GET PROFILE ─────────────────────────────────────────────────────────

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            status: true,
            timezone: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

  // ─── MÉTODOS PRIVADOS ────────────────────────────────────────────────────

  private async generateTokens(
    userId: string,
    email: string,
    tenantId: string,
    tenantName: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      tenantId,
      tenantName,
      role: role as JwtPayload['role'],
      permissions: this.getPermissionsForRole(role),
    };

    // Access Token
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('auth.jwt.accessToken.secret'),
      expiresIn: this.ACCESS_TOKEN_EXPIRES,
    });

    // Refresh Token (UUID v4 almacenado en BD)
    const refreshToken = uuidv4();

    // Calcular expiración (7 días)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRES_DAYS);

    // Guardar sesión
    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
        isRevoked: false,
      },
    });

    return { accessToken, refreshToken };
  }

  private async limitSessions(userId: string): Promise<void> {
    const activeSessions = await this.prisma.session.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (activeSessions.length >= this.MAX_SESSIONS) {
      // Revocar la sesión más antigua
      const oldestSession = activeSessions[0];
      await this.prisma.session.update({
        where: { id: oldestSession.id },
        data: { isRevoked: true },
      });

      this.logger.warn(
        `Sesión más antigua revocada para usuario: ${userId}`,
      );
    }
  }

  private getPermissionsForRole(role: string): string[] {
    const permissions: Record<string, string[]> = {
      SUPER_ADMIN: ['*'],
      TENANT_ADMIN: [
        'employees:read',
        'employees:write',
        'employees:delete',
        'employees:import',
        'attendance:read',
        'attendance:write',
        'projects:read',
        'projects:write',
        'projects:delete',
        'reports:read',
        'reports:export',
        'settings:read',
        'settings:write',
        'users:read',
        'users:write',
        'audit:read',
        'geolocation:read',
        'geolocation:write',
        'overtime:read',
        'overtime:approve',
      ],
      MANAGER: [
        'employees:read',
        'employees:write',
        'attendance:read',
        'attendance:write',
        'projects:read',
        'projects:write',
        'reports:read',
        'reports:export',
        'overtime:read',
        'overtime:approve',
        'geolocation:read',
      ],
      EMPLOYEE: [
        'attendance:read',
        'attendance:write',
        'overtime:read',
        'overtime:write',
      ],
    };

    return permissions[role] || [];
  }
}
