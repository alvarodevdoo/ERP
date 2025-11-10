import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { config } from './config';
import { prisma } from './database/client';
import { errorHandler } from './shared/middlewares/error-handler';
import { authPreHandler } from './shared/middlewares/auth';
import { tenantPreHandler } from './shared/middlewares/tenant';

// Import routes
import { authRoutes } from './modules/auth/routes';
import { companyRoutes } from './modules/company/routes';
import { userRoutes } from './modules/user/routes';
import { roleRoutes } from './modules/role/routes';
import { employeeRoutes } from './modules/employee/routes';
import { productRoutes, productCategoryRoutes } from './modules/product/routes';
import { partnerRoutes } from './modules/partner/routes';
import { quoteRoutes } from './modules/quote/routes';
import { orderRoutes } from './modules/order/routes';
import { stockRoutes } from './modules/stock/routes';
import { financialRoutes } from './modules/financial/routes';
// import { uploadRoutes } from './modules/upload/routes';


const server = Fastify({
  logger: {
    level: config.LOG_LEVEL,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
}).withTypeProvider<ZodTypeProvider>();

// Removemos os compiladores de Zod para evitar conflitos de runtime
// com schemas JSON e middlewares de validação. As rotas que usam Zod
// devem validar via preHandler.

// Register plugins
server.register(sensible);
server.register(helmet, {
  contentSecurityPolicy: false,
});

server.register(cors, {
  origin: config.CORS_ORIGIN.includes(',')
    ? config.CORS_ORIGIN.split(',')
    : config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
});

server.register(rateLimit, {
  max: config.RATE_LIMIT_MAX,
  timeWindow: config.RATE_LIMIT_WINDOW,
});

server.register(multipart, {
  limits: {
    fileSize: config.MAX_FILE_SIZE,
  },
});

// Decorate request object globally
server.decorateRequest('user', undefined);
server.decorateRequest('userId', '');
server.decorateRequest('companyId', '');
server.decorateRequest('products', '');

// Decorate server with prisma - must be done before registering routes
if (!server.hasDecorator('prisma')) {
  server.decorate('prisma', prisma);
}

// Swagger / OpenAPI documentation
server.register(swagger, {
  openapi: {
    openapi: '3.1.0',
    info: {
      title: 'ArtPlim ERP API',
      description: 'Documentação da API do ArtPlim ERP',
      version: '1.0.0',
    },
    servers: [
      { url: `http://localhost:${config.PORT}`, description: 'Desenvolvimento local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
});

server.register(swaggerUI, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
  staticCSP: false,
  transformStaticCSP: (header) => header,
});

// Register global middlewares
  server.register(errorHandler);
  server.addHook('preHandler', authPreHandler);
  server.addHook('preHandler', tenantPreHandler);
// Health check
server.get('/health', async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', timestamp: new Date().toISOString() };
  } catch (error) {
    server.log.error({ err: error }, 'Health check failed:');
    throw server.httpErrors.serviceUnavailable('Database connection failed');
  }
});

// Register routes
server.register(authRoutes, { prefix: '/api/auth' });
server.register(companyRoutes, { prefix: '/api/companies' });
// server.register(userRoutes, { prefix: '/api/users' });
// server.register(roleRoutes, { prefix: '/api/roles' });
// server.register(employeeRoutes, { prefix: '/api/employees' });
server.register(productRoutes, { prefix: '/api/products' });
server.register(productCategoryRoutes, { prefix: '/api/product-categories' });
// server.register(partnerRoutes, { prefix: '/api/partners' });
// server.register(quoteRoutes, { prefix: '/api/quotes' });
// server.register(orderRoutes, { prefix: '/api/orders' });
// server.register(stockRoutes, { prefix: '/api/stock' });
// server.register(financialRoutes, { prefix: '/api/financial' });
// server.register(uploadRoutes, { prefix: '/api/upload' });

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  server.log.info(`Received ${signal}, shutting down gracefully...`);

  try {
    await server.close();
    await prisma.$disconnect();
    server.log.info('Server closed successfully');
    process.exit(0);
  } catch (error) {
    server.log.error({ err: error }, 'Error during shutdown:');
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { server };