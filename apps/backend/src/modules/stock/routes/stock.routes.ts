import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { StockService } from '../services';
import { RoleService } from '../../role/services/role.service';
import { RoleRepository } from '../../role/repositories/role.repository';
import { 
  stockMovementSchema,
  stockAdjustmentSchema,
  stockTransferSchema,
  stockReservationSchema,
  cancelStockReservationSchema,
  stockFiltersSchema,
  stockMovementFiltersSchema,
  stockReservationFiltersSchema,
  createStockLocationSchema,
  updateStockLocationSchema
} from '../dtos';

export async function stockRoutes(fastify: FastifyInstance) {
  const roleRepository = new RoleRepository(fastify.prisma);
  const roleService = new RoleService(roleRepository);
  const stockService = new StockService(fastify.prisma, roleService);

  // fastify.addHook('preHandler', authMiddleware); // Temporarily commented out

  fastify.post('/in', {
    schema: { tags: ['Stock'], body: stockMovementSchema },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof stockMovementSchema> }>, reply: FastifyReply) => {
    const movement = await stockService.stockIn(request.body as any, request.user!.id, request.user!.companyId);
    return reply.status(201).send({ success: true, data: movement });
  });

  fastify.post('/out', {
    schema: { tags: ['Stock'], body: stockMovementSchema },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof stockMovementSchema> }>, reply: FastifyReply) => {
    const movement = await stockService.stockOut(request.body as any, request.user!.id, request.user!.companyId);
    return reply.status(201).send({ success: true, data: movement });
  });

  fastify.post('/adjust', {
    schema: { tags: ['Stock'], body: stockAdjustmentSchema },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof stockAdjustmentSchema> }>, reply: FastifyReply) => {
    const movement = await stockService.adjustStock(request.body as any, request.user!.id, request.user!.companyId);
    return reply.status(201).send({ success: true, data: movement });
  });

  fastify.post('/transfer', {
    schema: { tags: ['Stock'], body: stockTransferSchema },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof stockTransferSchema> }>, reply: FastifyReply) => {
    const movement = await stockService.transferStock(request.body as any, request.user!.id, request.user!.companyId);
    return reply.status(201).send({ success: true, data: movement });
  });

  fastify.get('/', {
    schema: { tags: ['Stock'], querystring: stockFiltersSchema },
  }, async (request: FastifyRequest<{ Querystring: z.infer<typeof stockFiltersSchema> }>, reply: FastifyReply) => {
    const result = await stockService.findMany(request.query as any, request.user!.id, request.user!.companyId);
    return reply.send({ success: true, data: result.items, pagination: { total: result.total, page: (request.query as any).page, limit: (request.query as any).limit, totalPages: Math.ceil(result.total / (request.query as any).limit) } });
  });

  fastify.get('/product/:productId', {
    schema: { tags: ['Stock'], params: z.object({ productId: z.string() }), querystring: z.object({ locationId: z.string().optional() }) },
  }, async (request: FastifyRequest<{ Params: { productId: string }; Querystring: { locationId?: string } }>, reply: FastifyReply) => {
    const stockItem = await stockService.findStockItem(request.params.productId, request.query.locationId, request.user!.id, request.user!.companyId);
    if (!stockItem) {
      return reply.status(404).send({ success: false, message: 'Item de estoque não encontrado' });
    }
    return reply.send({ success: true, data: stockItem });
  });

  fastify.get('/movements', {
    schema: { tags: ['Stock'], querystring: stockMovementFiltersSchema },
  }, async (request: FastifyRequest<{ Querystring: z.infer<typeof stockMovementFiltersSchema> }>, reply: FastifyReply) => {
    const result = await stockService.findMovements(request.query as any, request.user!.id, request.user!.companyId);
    return reply.send({ success: true, data: result.items, pagination: { total: result.total, page: (request.query as any).page, limit: (request.query as any).limit, totalPages: Math.ceil(result.total / (request.query as any).limit) } });
  });

  fastify.post('/reservations', {
    schema: { tags: ['Stock'], body: stockReservationSchema },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof stockReservationSchema> }>, reply: FastifyReply) => {
    const reservation = await stockService.createReservation(request.body as any, request.user!.id, request.user!.companyId);
    return reply.status(201).send({ success: true, data: reservation });
  });

  fastify.put('/reservations/:id/cancel', {
    schema: { tags: ['Stock'], params: z.object({ id: z.string() }), body: cancelStockReservationSchema },
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: z.infer<typeof cancelStockReservationSchema> }>, reply: FastifyReply) => {
    await stockService.cancelReservation(request.params.id, request.body as any, request.user!.id, request.user!.companyId);
    return reply.send({ success: true, message: 'Reserva cancelada com sucesso' });
  });

  fastify.get('/reservations', {
    schema: { tags: ['Stock'], querystring: stockReservationFiltersSchema },
  }, async (request: FastifyRequest<{ Querystring: z.infer<typeof stockReservationFiltersSchema> }>, reply: FastifyReply) => {
    const result = await stockService.findReservations(request.query as any, request.user!.id, request.user!.companyId);
    return reply.send({ success: true, data: result.items, pagination: { total: result.total, page: (request.query as any).page, limit: (request.query as any).limit, totalPages: Math.ceil(result.total / (request.query as any).limit) } });
  });

  fastify.post('/locations', {
    schema: { tags: ['Stock'], body: createStockLocationSchema },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof createStockLocationSchema> }>, reply: FastifyReply) => {
    const location = await stockService.createLocation(request.body as any, request.user!.id, request.user!.companyId);
    return reply.status(201).send({ success: true, data: location });
  });

  fastify.get('/locations/:id', {
    schema: { tags: ['Stock'], params: z.object({ id: z.string() }) },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const location = await stockService.findLocationById(request.params.id, request.user!.id, request.user!.companyId);
    if (!location) {
      return reply.status(404).send({ success: false, message: 'Localização não encontrada' });
    }
    return reply.send({ success: true, data: location });
  });

  fastify.put('/locations/:id', {
    schema: { tags: ['Stock'], params: z.object({ id: z.string() }), body: updateStockLocationSchema },
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: z.infer<typeof updateStockLocationSchema> }>, reply: FastifyReply) => {
    const location = await stockService.updateLocation(request.params.id, request.body as any, request.user!.id, request.user!.companyId);
    return reply.send({ success: true, data: location });
  });

  fastify.delete('/locations/:id', {
    schema: { tags: ['Stock'], params: z.object({ id: z.string() }) },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    await stockService.deleteLocation(request.params.id, request.user!.id, request.user!.companyId);
    return reply.send({ success: true, message: 'Localização removida com sucesso' });
  });

  fastify.get('/stats', {
    schema: { tags: ['Stock'] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const stats = await stockService.getStats(request.user!.id, request.user!.companyId);
    return reply.send({ success: true, data: stats });
  });

  fastify.get('/report', {
    schema: { tags: ['Stock'], querystring: z.object({ format: z.enum(['json', 'csv']).optional() }) },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const format = (request.query as any).format || 'json';
    const report = await stockService.generateReport(format, request.user!.id, request.user!.companyId);
    if (format === 'csv') {
      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', 'attachment; filename="relatorio-estoque.csv"');
      return reply.send(report);
    }
    return reply.send({ success: true, data: report });
  });

  fastify.get('/movements/report', {
    schema: { tags: ['Stock'], querystring: z.object({ format: z.enum(['json', 'csv']).optional(), startDate: z.string().optional(), endDate: z.string().optional() }) },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { format = 'json', startDate, endDate } = request.query as any;
    const report = await stockService.generateMovementReport(format, startDate, endDate, request.user!.id, request.user!.companyId);
    if (format === 'csv') {
      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', 'attachment; filename="relatorio-movimentacoes.csv"');
      return reply.send(report);
    }
    return reply.send({ success: true, data: report });
  });

  fastify.get('/dashboard', {
    schema: { tags: ['Stock'] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const dashboard = await stockService.getDashboard(request.user!.id, request.user!.companyId);
    return reply.send({ success: true, data: dashboard });
  });
}