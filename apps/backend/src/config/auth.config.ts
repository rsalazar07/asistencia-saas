// ==========================================================================
// Configuración de Autenticación
// ==========================================================================

export interface JwtConfig {
  accessToken: {
    secret: string;
    expiresIn: string;
    algorithm: string;
  };
  refreshToken: {
    secret: string;
    expiresIn: string;
    algorithm: string;
  };
}

export interface AuthConfig {
  jwt: JwtConfig;
  bcrypt: {
    saltRounds: number;
  };
  session: {
    maxDevices: number;
  };
  passwordPolicy: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAttempts: number;
    lockoutDuration: number; // segundos
    expiryDays: number;
  };
  throttling: {
    login: { windowMs: number; max: number };
    register: { windowMs: number; max: number };
    forgotPassword: { windowMs: number; max: number };
    global: { windowMs: number; max: number };
  };
}

export default (): { auth: AuthConfig } => ({
  auth: {
    jwt: {
      accessToken: {
        secret: process.env.JWT_ACCESS_SECRET || 'super-secret-access-key-change-in-production',
        expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
        algorithm: 'HS256',
      },
      refreshToken: {
        secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-change-in-production',
        expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
        algorithm: 'HS256',
      },
    },
    bcrypt: {
      saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
    },
    session: {
      maxDevices: parseInt(process.env.MAX_SESSIONS_PER_USER || '5', 10),
    },
    passwordPolicy: {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAttempts: 5,
      lockoutDuration: 15 * 60, // 15 minutos
      expiryDays: 90,
    },
    throttling: {
      login: { windowMs: 15 * 60 * 1000, max: 5 },
      register: { windowMs: 60 * 60 * 1000, max: 3 },
      forgotPassword: { windowMs: 60 * 60 * 1000, max: 3 },
      global: { windowMs: 60 * 1000, max: 100 },
    },
  },
});
