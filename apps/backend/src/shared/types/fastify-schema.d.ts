import 'fastify';

declare module 'fastify' {
  interface FastifySchema {
    /**
     * OpenAPI/Swagger route tags for grouping in docs
     */
    tags?: string[];
    /**
     * Short summary shown in OpenAPI docs
     */
    summary?: string;
  }
}