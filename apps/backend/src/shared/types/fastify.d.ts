// apps/backend/src/shared/types/fastify-extensions.d.ts

// Esta linha é crucial para que o TypeScript saiba que você está estendendo o módulo 'fastify'
import 'fastify';

/**
 * Estende o objeto FastifyRequest para incluir as propriedades
 * adicionadas pelos middlewares de autenticação e tenant.
 */
declare module 'fastify' {
  interface FastifyRequest {
    // Estas propriedades agora serão reconhecidas pelo TypeScript
    // como sempre presentes em um FastifyRequest
    userId: string;
    companyId: string;
  }

  // Opcional: Estender a Instância do Fastify se você adicionar propriedades nela
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}