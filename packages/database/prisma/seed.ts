// ==========================================================================
// SEED - Datos iniciales para desarrollo
// ==========================================================================

import { PrismaClient, TenantStatus, UserRole, EmployeeStatus, ProjectStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ─── TENANT DEMO ─────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { name: 'Empresa Demo SAC' },
    update: {},
    create: {
      name: 'Empresa Demo SAC',
      legalName: 'Empresa Demo Sociedad Anónima Cerrada',
      rut: '20123456789',
      email: 'info@empresademo.pe',
      phone: '+51 1 234 5678',
      address: 'Av. Principal 123, Lima, Perú',
      status: TenantStatus.ACTIVE,
      maxEmployees: 100,
      maxProjects: 30,
      timezone: 'America/Lima',
      config: {
        allowedDomains: [],
        requirePhoto: false,
        requireGps: true,
        geofenceRadius: 100,
      },
    },
  });

  console.log(`✅ Tenant creado: ${tenant.name} (${tenant.id})`);

  // ─── HORARIO LABORAL ─────────────────────────────────────────────────
  const workSchedule = await prisma.workSchedule.create({
    data: {
      tenantId: tenant.id,
      name: 'Horario Oficina',
      description: 'Lunes a Viernes 8am - 5pm',
      isDefault: true,
      details: {
        create: [
          { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00', graceMinutes: 15 },
          { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00', graceMinutes: 15 },
          { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00', graceMinutes: 15 },
          { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00', graceMinutes: 15 },
          { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00', graceMinutes: 15 },
          { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isWorkingDay: false },
          { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isWorkingDay: false },
        ],
      },
    },
  });

  console.log(`✅ Horario creado: ${workSchedule.name}`);

  // ─── GEOFENCE ────────────────────────────────────────────────────────
  const geoFence = await prisma.geoFence.create({
    data: {
      tenantId: tenant.id,
      name: 'Oficina Principal',
      address: 'Av. Principal 123, Lima',
      latitude: -12.046374,
      longitude: -77.042793,
      radius: 100,
      workScheduleId: workSchedule.id,
    },
  });

  console.log(`✅ Geofence creado: ${geoFence.name}`);

  // ─── USUARIOS ────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin123!', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@empresademo.pe' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@empresademo.pe',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Principal',
      role: UserRole.TENANT_ADMIN,
      isActive: true,
    },
  });

  console.log(`✅ Usuario admin: ${adminUser.email}`);

  const managerUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'gerente@empresademo.pe',
      passwordHash,
      firstName: 'Carlos',
      lastName: 'García',
      role: UserRole.MANAGER,
      isActive: true,
    },
  });

  console.log(`✅ Usuario manager: ${managerUser.email}`);

  // ─── EMPLEADOS ───────────────────────────────────────────────────────
  const employeesData = [
    { firstName: 'Juan', lastName: 'Pérez', documentNumber: '12345678', position: 'Desarrollador Senior', department: 'TI' },
    { firstName: 'María', lastName: 'López', documentNumber: '23456789', position: 'Diseñadora UX', department: 'Diseño' },
    { firstName: 'Pedro', lastName: 'Ramírez', documentNumber: '34567890', position: 'Analista de Datos', department: 'TI' },
    { firstName: 'Ana', lastName: 'Torres', documentNumber: '45678901', position: 'Community Manager', department: 'Marketing' },
    { firstName: 'Luis', lastName: 'Fernández', documentNumber: '56789012', position: 'Contador', department: 'Finanzas' },
  ];

  const employees = [];
  for (const empData of employeesData) {
    const employee = await prisma.employee.create({
      data: {
        tenantId: tenant.id,
        ...empData,
        documentType: 'DNI',
        email: `${empData.firstName.toLowerCase()}.${empData.lastName.toLowerCase()}@empresademo.pe`,
        phone: `+51 9${Math.floor(10000000 + Math.random() * 90000000)}`,
        hireDate: new Date('2024-01-01'),
        status: EmployeeStatus.ACTIVE,
        workScheduleId: workSchedule.id,
      },
    });
    employees.push(employee);
    console.log(`  👤 Empleado: ${employee.firstName} ${employee.lastName}`);
  }

  // ─── PROYECTOS ───────────────────────────────────────────────────────
  const projectsData = [
    { name: 'Plataforma E-commerce', code: 'P001', description: 'Desarrollo de tienda online', color: '#3B82F6' },
    { name: 'App Móvil POS', code: 'P002', description: 'Sistema de punto de venta móvil', color: '#10B981' },
    { name: 'Rediseño Web', code: 'P003', description: 'Rediseño del sitio corporativo', color: '#F59E0B' },
  ];

  const projects = [];
  for (const projData of projectsData) {
    const project = await prisma.project.create({
      data: {
        tenantId: tenant.id,
        ...projData,
        startDate: new Date('2025-01-01'),
        status: ProjectStatus.ACTIVE,
      },
    });
    projects.push(project);
    console.log(`  📋 Proyecto: ${project.name}`);
  }

  // ─── ASIGNACIONES ────────────────────────────────────────────────────
  const assignments = [
    { employee: employees[0], project: projects[0], role: 'Tech Lead' },
    { employee: employees[1], project: projects[0], role: 'UI/UX Designer' },
    { employee: employees[2], project: projects[2], role: 'Analista' },
    { employee: employees[3], project: projects[2], role: 'Contenido' },
    { employee: employees[4], project: projects[1], role: 'Consultor Financiero' },
  ];

  for (const assign of assignments) {
    await prisma.projectAssignment.create({
      data: {
        tenantId: tenant.id,
        employeeId: assign.employee.id,
        projectId: assign.project.id,
        role: assign.role,
        startDate: new Date('2025-01-15'),
        isActive: true,
      },
    });
  }

  console.log(`✅ Asignaciones creadas: ${assignments.length}`);

  // ─── ASISTENCIA DE PRUEBA (Hoy) ──────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const emp of employees.slice(0, 4)) {
    const checkIn = new Date();
    checkIn.setHours(8, 5 + Math.floor(Math.random() * 10), 0, 0); // 8:05 - 8:15

    const checkOut = new Date();
    checkOut.setHours(17, 0 + Math.floor(Math.random() * 30), 0, 0); // 17:00 - 17:30

    const lateMinutes = checkIn.getHours() * 60 + checkIn.getMinutes() - 480; // 480 = 8:00
    const workedMinutes = Math.round((checkOut.getTime() - checkIn.getTime()) / 60000) - 60; // -60 min break

    await prisma.attendance.create({
      data: {
        tenantId: tenant.id,
        employeeId: emp.id,
        date: today,
        checkIn,
        checkInLat: -12.046374 + (Math.random() - 0.5) * 0.001,
        checkInLng: -77.042793 + (Math.random() - 0.5) * 0.001,
        checkInMethod: 'GPS',
        checkInAddress: 'Av. Principal 123, Lima',
        checkOut,
        checkOutLat: -12.046374 + (Math.random() - 0.5) * 0.001,
        checkOutLng: -77.042793 + (Math.random() - 0.5) * 0.001,
        checkOutMethod: 'GPS',
        checkOutAddress: 'Av. Principal 123, Lima',
        status: lateMinutes > 15 ? 'LATE' as any : 'ON_TIME' as any,
        workedMinutes,
        lateMinutes: lateMinutes > 15 ? lateMinutes : 0,
        isComplete: true,
      },
    });
  }

  console.log(`✅ Asistencia de prueba creada`);

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📧 Credenciales de acceso:');
  console.log('   Admin:  admin@empresademo.pe / Admin123!');
  console.log('   Gerente: gerente@empresademo.pe / Admin123!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
