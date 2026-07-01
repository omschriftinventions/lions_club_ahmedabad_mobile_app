import 'dotenv/config';
import path from 'path';

function need(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing env: ${name}`);
  return v;
}

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),

  db: {
    host: need('DB_HOST', '127.0.0.1'),
    port: Number(process.env.DB_PORT ?? 3306),
    user: need('DB_USER', 'lions'),
    password: need('DB_PASSWORD', 'lionspass'),
    database: need('DB_NAME', 'lionsclub'),
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? 10),
  },

  jwt: {
    accessSecret: need('JWT_ACCESS_SECRET', 'dev-access-secret'),
    refreshSecret: need('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '30d',
  },

  otp: {
    ttlSeconds: Number(process.env.OTP_TTL_SECONDS ?? 300),
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS ?? 5),
    devLog: (process.env.OTP_DEV_LOG ?? 'true') === 'true',
    // DEV ONLY: skips OTP code check. Any 6-digit code accepted for any
    // phone present in `members`. NEVER enable in production.
    devBypass: (process.env.DEV_BYPASS_OTP ?? 'false') === 'true',
  },

  sms: {
    provider: process.env.SMS_PROVIDER ?? '',
    apiKey: process.env.SMS_API_KEY ?? '',
    senderId: process.env.SMS_SENDER_ID ?? 'LIONSC',
  },

  expo: {
    accessToken: process.env.EXPO_ACCESS_TOKEN ?? '',
  },

  cors: {
    origins: (process.env.CORS_ORIGINS ?? '').split(',').map(s => s.trim()).filter(Boolean),
  },

  uploads: {
    // Absolute dir where uploaded photos are written. Default: <cwd>/uploads/photos
    dir: process.env.UPLOADS_DIR ?? path.resolve(process.cwd(), 'uploads', 'photos'),
    // Public base used to build photo URLs. If empty, derived from the request host.
    publicBaseUrl: (process.env.PUBLIC_BASE_URL ?? '').replace(/\/+$/, ''),
  },
};
