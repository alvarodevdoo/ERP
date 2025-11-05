import { z, ZodSchema } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Converte um schema Zod para JSON Schema compatível com OpenAPI 3
export function toJsonSchema(schema: ZodSchema) {
  return zodToJsonSchema(schema as z.ZodTypeAny, {
    target: 'openApi3',
    $refStrategy: 'none',
    errorMessages: true,
  });
}

// Helper para montar objeto "schema" de rotas Fastify
export function buildRouteSchema(options: {
  body?: ZodSchema;
  params?: ZodSchema;
  querystring?: ZodSchema;
  headers?: ZodSchema;
  tags?: string[];
}) {
  const schema: any = {};
  if (options.tags) schema.tags = options.tags;
  if (options.body) schema.body = toJsonSchema(options.body);
  if (options.params) schema.params = toJsonSchema(options.params);
  if (options.querystring) schema.querystring = toJsonSchema(options.querystring);
  if (options.headers) schema.headers = toJsonSchema(options.headers);
  return schema;
}