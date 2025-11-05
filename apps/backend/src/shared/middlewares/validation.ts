import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z, ZodSchema, ZodError } from 'zod';

interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  querystring?: ZodSchema;
  headers?: ZodSchema;
}

export async function validationMiddleware(fastify: FastifyInstance) {
  // Register validation decorator
  fastify.decorate('validate', (schemas: ValidationSchemas) => {
    // 
    return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        // Validate request body
        if (schemas.body && request.body) {
          request.body = schemas.body.parse(request.body);
        }

        // Validate route parameters
        if (schemas.params && request.params) {
          request.params = schemas.params.parse(request.params);
        }

        // Validate query string
        if (schemas.querystring && request.query) {
          request.query = schemas.querystring.parse(request.query);
        }

        // Validate headers (do not reassign request.headers, just parse to validate)
        if (schemas.headers && request.headers) {
          schemas.headers.parse(request.headers);
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          reply.status(400).send({
            error: 'Validation Error',
            message: 'Invalid request data',
            details: error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          });
          return;
        }
        throw error;
      }
    };
  });
}

// Common validation schemas
export const commonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.string().optional().default('1').transform(Number),
    limit: z.string().optional().default('10').transform(Number),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),

  // ID parameter
  idParam: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),

  // Date range
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),

  // File upload
  fileUpload: z.object({
    filename: z.string().min(1, 'Filename is required'),
    mimetype: z.string().min(1, 'MIME type is required'),
    size: z.number().positive('File size must be positive'),
  }),
};

// Helper function to create validation middleware
export function createValidation(schemas: ValidationSchemas) {
  // 
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      // Validate request body
      if (schemas.body && request.body) {
        request.body = schemas.body.parse(request.body);
      }

      // Validate route parameters
      if (schemas.params && request.params) {
        request.params = schemas.params.parse(request.params);
      }

      // Validate query string
      if (schemas.querystring && request.query) {
        request.query = schemas.querystring.parse(request.query);
      }

      // Validate headers (do not reassign request.headers, just parse to validate)
      if (schemas.headers && request.headers) {
        schemas.headers.parse(request.headers);
      }
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        reply.status(400).send({
          success: false,
          message: 'Erro de validação',
          errors: error.issues.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
      
      reply.status(500).send({
        success: false,
        message: 'Erro interno de validação',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return;
    }
  };
}

// Extend Fastify instance type
declare module 'fastify' {
  interface FastifyInstance {
    validate: (schemas: ValidationSchemas) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}