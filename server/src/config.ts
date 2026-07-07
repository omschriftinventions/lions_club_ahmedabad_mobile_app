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

  ai: {
    baseUrl: process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1',
    chatModel: process.env.AI_CHAT_MODEL || 'anthropic/claude-haiku-4.5',
    chatModelFallback: process.env.AI_CHAT_MODEL_FALLBACK || 'nvidia/nemotron-3-super-120b-a12b:free',
    apiKey: process.env.AI_API_KEY || '',
  },

  stt: {
    baseUrl: process.env.STT_BASE_URL || 'https://api.groq.com/openai/v1/audio/transcriptions',
    apiKey: process.env.STT_API_KEY || '',
    model: process.env.STT_MODEL || 'whisper-large-v3',
  },

  uploads: {
    dir: process.env.UPLOADS_DIR ?? path.resolve(process.cwd(), 'uploads', 'photos'),
    publicBaseUrl: (process.env.PUBLIC_BASE_URL ?? '').replace(/\/+$/, ''),
  },
};