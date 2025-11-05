// Configuração para ambiente de teste
export const config = {
  NODE_ENV: 'test',
  PORT: 3000,
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  JWT_SECRET: 'test-secret',
  JWT_EXPIRES_IN: '1h',
  REFRESH_TOKEN_SECRET: 'test-refresh-secret',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  LOG_LEVEL: 'silent'
};