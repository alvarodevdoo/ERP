/**
 * Middleware de validação para rotas Fastify
 * Valida body, querystring, params e headers usando Zod schemas
 */

import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { z, ZodSchema, ZodError, ZodIssue } from 'zod';

/**
 * Interface para configuração de validação
 */
export interface ValidationConfig {
  body?: ZodSchema;
  querystring?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}

// Custom type guard for ZodError with errors property
function isZodErrorWithIssues(error: any): error is ZodError {
  return error instanceof ZodError && Array.isArray((error as any).errors);
}

/**
 * Cria um middleware de validação para uso em rotas Fastify
 * @param config Configuração de validação com schemas Zod
 * @returns Middleware de validação
 */
export function createValidation(config: ValidationConfig) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      // Validar body
      if (config.body && request.body !== undefined) {
        const validatedBody = config.body.parse(request.body);
        request.body = validatedBody;
      }

      // Validar querystring
      if (config.querystring && request.query !== undefined) {
        const validatedQuery = config.querystring.parse(request.query);
        request.query = validatedQuery;
      }

      // Validar params
      if (config.params && request.params !== undefined) {
        const validatedParams = config.params.parse(request.params);
        request.params = validatedParams;
      }

      // Validar headers
      if (config.headers && request.headers !== undefined) {
        const validatedHeaders = config.headers.parse(request.headers);
        // Headers são imutáveis no Fastify, então apenas validamos
        // Não os substituímos no request
      }
    } catch (error) {
      request.log.error({ error }, 'Validation Error caught:'); // NEW DEBUG LOG
      if (isZodErrorWithIssues(error)) {
        reply.code(400).send({
          success: false,
          message: 'Erro de validação',
          errors: (error as any).errors.map((err: ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
        throw error;
      } else if (
        error &&
        typeof error === 'object' &&
        'errors' in error &&
        Array.isArray((error as any).errors) // Use any to bypass type checking for the check
      ) {
        // Fallback for cases where ZodError might be wrapped or not fully recognized
        reply.code(400).send({
          success: false,
          message: 'Erro de validação',
          errors: (error as any).errors.map((err: ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
        throw error;
      }
      
      // Para outros tipos de erro, lançamos o erro para o error handler global
      throw error;
    }
  };
}

/**
 * Schemas comuns reutilizáveis
 */
export const commonSchemas = {
  /**
   * Schema para paginação
   */
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
  }),

  /**
   * Schema para ID de recurso
   */
  idParam: z.object({
    id: z.string().uuid()
  }),

  /**
   * Schema para busca/filtro
   */
  search: z.object({
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
  }),

  /**
   * Schema para datas de filtro
   */
  dateRange: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional()
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: 'A data inicial deve ser menor ou igual à data final'
    }
  ),

  /**
   * Schema para status booleano
   */
  status: z.object({
    status: z.enum(['active', 'inactive', 'all']).optional().default('all')
  })
};