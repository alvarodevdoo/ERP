// apps/backend/src/shared/types/fastify-extensions.d.ts

import 'fastify';
import { PrismaClient } from '@prisma/client';

/**
 * Estende o objeto FastifyRequest para incluir as propriedades
 * adicionadas pelos middlewares de autenticação e tenant.
 */
declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
    companyId: string;
  }

  interface FastifyInstance {
    prisma: PrismaClient;
  }
}