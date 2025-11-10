import 'dotenv/config';
import { server } from './server';
import { config } from './config';
import { logger } from './shared/logger/index';

const start = async () => {
  try {
    await server.listen({
      port: config.PORT,
      host: '0.0.0.0',
    });
    
    logger.info(`🚀 Server running on http://localhost:${config.PORT}`);
    logger.info(`📊 Environment: ${config.NODE_ENV}`);
    logger.info(`🔗 CORS Origin: ${config.CORS_ORIGIN}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error({ err: error, stack: error.stack }, 'Falha ao iniciar o servidor');
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logger.error({ err: error as any }, 'Falha ao iniciar o servidor');
    }
    process.exit(1);
  }
};

start();