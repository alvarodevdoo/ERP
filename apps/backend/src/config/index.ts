import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
const config = {
  PORT: 3001,
  NODE_ENV: 'development',
  CORS_ORIGIN: 'http://localhost:5173',
  DATABASE_URL: 'postgresql://artplim:artplim123@localhost:5432/artplim_erp?schema=public',
  REDIS_URL: 'redis://localhost:6379',
  JWT_SECRET: 'bfbaf8c14c6b80c1b5d4b4ef7eebd7546fcda6153e5ce5abfb6f8626650d0bbb',
  JWT_EXPIRES_IN: '7d',
  JWT_REFRESH_EXPIRES_IN: '30d',
  MINIO_ENDPOINT: 'localhost',
  MINIO_PORT: 9000,
  MINIO_ACCESS_KEY: 'artplim',
  MINIO_SECRET_KEY: 'artplim123',
  MINIO_BUCKET: 'artplim-files',
  MINIO_USE_SSL: false,
  SMTP_HOST: undefined,
  SMTP_PORT: 587,
  SMTP_SECURE: false,
  SMTP_USER: undefined,
  SMTP_PASS: undefined,
  SMTP_FROM: 'ArtPlim ERP <noreply@artplim.com>',
  MAX_FILE_SIZE: 10485760,
  ALLOWED_FILE_TYPES: 'image/jpeg,image/png,image/gif,application/pdf,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  RATE_LIMIT_MAX: 100,
  RATE_LIMIT_WINDOW: 900000,
  LOG_LEVEL: 'info',
};

export { config };