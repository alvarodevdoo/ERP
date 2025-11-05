import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { 
  createQuoteSchema,
  updateQuoteSchema,
  quoteFiltersSchema,
  updateQuoteStatusSchema,
  duplicateQuoteSchema,
  convertToOrderSchema
} from '../dtos';
import { QuoteService } from '../services';
import { PrismaClient } from '@prisma/client';

export async function quoteRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();
  const quoteService = new QuoteService(prisma);
  const reportQuerySchema = quoteFiltersSchema.extend({ format: z.enum(['json', 'csv']).optional() });

  // fastify.addHook('preHandler', authMiddleware); // Temporarily commented out

  fastify.post('/', {
    schema: {
      tags: ['Quotes'],
      body: createQuoteSchema,
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof createQuoteSchema> }>, reply: FastifyReply) => {
    const quote = await quoteService.create(request.body, request.user!.id, request.user!.companyId);
    return reply.status(201).send({ success: true, data: quote });
  });

  fastify.get('/', {
    schema: {
      tags: ['Quotes'],
      querystring: quoteFiltersSchema,
    },
  }, async (request: FastifyRequest<{ Querystring: z.infer<typeof quoteFiltersSchema> }>, reply: FastifyReply) => {
    const result = await quoteService.findMany(request.query, request.user!.id, request.user!.companyId);
    return reply.send({ success: true, data: result.quotes, pagination: result.pagination });
  });

  fastify.get('/:id', {
    schema: {
      tags: ['Quotes'],
      params: z.object({ id: z.string().uuid() }),
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const quote = await quoteService.findById(request.params.id, request.user!.id, request.user!.companyId);
    return reply.send({ success: true, data: quote });
  });

  fastify.put('/:id', {
    schema: {
      tags: ['Quotes'],
      params: z.object({ id: z.string().uuid() }),
      body: updateQuoteSchema,
    },
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: z.infer<typeof updateQuoteSchema> }>, reply: FastifyReply) => {
    const quote = await quoteService.update(request.params.id, request.body, request.user!.id, request.user!.companyId);
    return reply.send({ success: true, data: quote });
  });

  fastify.delete('/:id', {
    schema: {
      tags: ['Quotes'],
      params: z.object({ id: z.string().uuid() }),
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    await quoteService.delete(request.params.id, request.user!.id, request.user!.companyId);
    return reply.status(204).send();
  });

  fastify.patch('/:id/restore', {
    schema: {
      tags: ['Quotes'],
      params: z.object({ id: z.string().uuid() }),
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const quote = await quoteService.restore(request.params.id, request.user!.id, request.user!.companyId);
    return reply.send({ success: true, data: quote });
  });

  fastify.patch('/:id/status', {
    schema: {
      tags: ['Quotes'],
      params: z.object({ id: z.string().uuid() }),
      body: updateQuoteStatusSchema,
    },
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: z.infer<typeof updateQuoteStatusSchema> }>, reply: FastifyReply) => {
    const quote = await quoteService.updateStatus(request.params.id, request.body, request.user!.id, request.user!.companyId);
    return reply.send({ success: true, data: quote });
  });

  fastify.post('/:id/duplicate', {
    schema: {
      tags: ['Quotes'],
      params: z.object({ id: z.string().uuid() }),
      body: duplicateQuoteSchema,
    },
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: z.infer<typeof duplicateQuoteSchema> }>, reply: FastifyReply) => {
    const quote = await quoteService.duplicate(request.params.id, request.body, request.user!.id, request.user!.companyId);
    return reply.status(201).send({ success: true, data: quote });
  });

  fastify.post('/:id/convert-to-order', {
    schema: {
      tags: ['Quotes'],
      params: z.object({ id: z.string().uuid() }),
      body: convertToOrderSchema,
    },
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: z.infer<typeof convertToOrderSchema> }>, reply: FastifyReply) => {
    const result = await quoteService.convertToOrder(request.params.id, request.body, request.user!.id, request.user!.companyId);
    return reply.status(201).send({ success: true, data: result });
  });

  fastify.get('/stats', {
    schema: { tags: ['Quotes'] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const stats = await quoteService.getStats(request.user!.id, request.user!.companyId);
    return reply.send({ success: true, data: stats });
  });

  fastify.get('/report', {
    schema: {
      tags: ['Quotes'],
      querystring: reportQuerySchema,
    },
  }, async (request: FastifyRequest<{ Querystring: z.infer<typeof reportQuerySchema> }>, reply: FastifyReply) => {
    const { format = 'json', ...filters } = request.query;
    const report = await quoteService.generateReport(filters, format, request.user!.id, request.user!.companyId);
    if (format === 'csv') {
      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', 'attachment; filename="relatorio-orcamentos.csv"');
      return reply.send(report);
    }
    return reply.send({ success: true, data: report });
  });
}