// ==========================================================================
// Configuración General de la Aplicación
// ==========================================================================

export default () => ({
  app: {
    port: parseInt(process.env.PORT || '3001', 10),
    env: process.env.NODE_ENV || 'development',
    name: 'Asistencia SaaS API',
    version: '1.0.0',
    apiPrefix: 'api/v1',
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || [
        'http://localhost:3000',
        'http://localhost:3001',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Tenant-Id',
      ],
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      prettyPrint: process.env.NODE_ENV !== 'production',
    },
    storage: {
      provider: process.env.STORAGE_PROVIDER || 'local', // local | s3 | minio
      endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
      bucket: process.env.STORAGE_BUCKET || 'asistencia-saas',
      accessKey: process.env.STORAGE_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.STORAGE_SECRET_KEY || 'minioadmin',
      region: process.env.STORAGE_REGION || 'us-east-1',
    },
  },
});
