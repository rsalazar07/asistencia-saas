// ==========================================================================
// Configuración de Redis
// ==========================================================================

export default () => ({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: 'asistencia:',
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetries: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10), // 5 minutos default
    employees: parseInt(process.env.CACHE_EMPLOYEES_TTL || '60', 10),
    attendance: parseInt(process.env.CACHE_ATTENDANCE_TTL || '30', 10),
  },
  queue: {
    report: {
      name: 'report-generation',
      concurrency: 3,
      maxRetries: 3,
    },
    email: {
      name: 'email-notifications',
      concurrency: 5,
      maxRetries: 5,
    },
    cleanup: {
      name: 'data-cleanup',
      concurrency: 1,
      maxRetries: 1,
    },
  },
});
