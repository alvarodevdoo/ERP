import 'fastify';

declare module 'fastify' {
  export interface FastifyInstance {
    // You can decorate the fastify instance here
  }

  interface FastifyRequest {
    user?: {
      id: string;
      companyId: string;
    };
    userId?: string;
  }
}