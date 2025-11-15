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

  fastify.post('/', async (request: FastifyRequest<{ Body: z.infer<typeof createQuoteSchema> }>, reply: FastifyReply) => {
    const userId = request.user?.id || 'system';
    const companyId = request.user?.companyId || request.body.customerId;
    const quote = await quoteService.create(request.body, userId, companyId);
    return reply.status(201).send({ success: true, data: quote });
  });

  fastify.get('/', async (request: FastifyRequest<{ Querystring: z.infer<typeof quoteFiltersSchema> }>, reply: FastifyReply) => {
    const userId = request.user?.id || 'system';
    const companyId = request.user?.companyId || '';
    const filters = quoteFiltersSchema.parse(request.query);
    const result = await quoteService.findMany(filters, userId, companyId);
    return reply.send({ success: true, data: result.quotes, pagination: result.pagination });
  });

  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.user?.id || 'system';
    const companyId = request.user?.companyId || '';
    const quote = await quoteService.findById(request.params.id, userId, companyId);
    return reply.send({ success: true, data: quote });
  });

  fastify.put('/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: z.infer<typeof updateQuoteSchema> }>, reply: FastifyReply) => {
    const userId = request.user?.id || 'system';
    const companyId = request.user?.companyId || '';
    const quote = await quoteService.update(request.params.id, request.body, userId, companyId);
    return reply.send({ success: true, data: quote });
  });

  fastify.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.user?.id || 'system';
    const companyId = request.user?.companyId || '';
    await quoteService.delete(request.params.id, userId, companyId);
    return reply.status(204).send();
  });

  fastify.patch('/:id/restore', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const quote = await quoteService.restore(request.params.id, request.user!.id, request.user!.companyId);
    return reply.send({ success: true, data: quote });
  });

  fastify.patch('/:id/status', async (request: FastifyRequest<{ Params: { id: string }; Body: z.infer<typeof updateQuoteStatusSchema> }>, reply: FastifyReply) => {
    const quote = await quoteService.updateStatus(request.params.id, request.body, request.user!.id, request.user!.companyId);
    return reply.send({ success: true, data: quote });
  });

  fastify.post('/:id/duplicate', async (request: FastifyRequest<{ Params: { id: string }; Body: z.infer<typeof duplicateQuoteSchema> }>, reply: FastifyReply) => {
    const quote = await quoteService.duplicate(request.params.id, request.body, request.user!.id, request.user!.companyId);
    return reply.status(201).send({ success: true, data: quote });
  });

  fastify.post('/:id/convert-to-order', async (request: FastifyRequest<{ Params: { id: string }; Body: z.infer<typeof convertToOrderSchema> }>, reply: FastifyReply) => {
    const result = await quoteService.convertToOrder(request.params.id, request.body, request.user!.id, request.user!.companyId);
    return reply.status(201).send({ success: true, data: result });
  });

  fastify.get('/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    const stats = await quoteService.getStats(request.user!.id, request.user!.companyId);
    return reply.send({ success: true, data: stats });
  });

  fastify.get('/report', async (request: FastifyRequest<{ Querystring: z.infer<typeof reportQuerySchema> }>, reply: FastifyReply) => {
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