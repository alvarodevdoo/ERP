import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  createOrderSchema,
  updateOrderSchema,
  orderFiltersSchema,
  updateOrderStatusSchema,
  // Removendo importação inexistente
  // assignOrderSchema,
  addOrderTimeTrackingSchema,
  updateOrderTimeTrackingSchema,
  addOrderExpenseSchema,
  updateOrderExpenseSchema,
  CreateOrderDTO,
  UpdateOrderDTO,
  OrderFiltersDTO,
  UpdateOrderStatusDTO,
  AddOrderTimeTrackingDTO,
  UpdateOrderTimeTrackingDTO,
  AddOrderExpenseDTO,
  UpdateOrderExpenseDTO
} from '../dtos';
import { OrderService } from '../services';
import { requirePermission } from '../../../shared/middlewares/auth';
import { createValidation, commonSchemas } from '../../../shared/middlewares/validation';
import { extractTenant } from '../../../shared/middlewares/tenant';

import { AppError } from '../../../shared/errors/AppError';

export async function orderRoutes(fastify: FastifyInstance) {
  const orderService = new OrderService(fastify.prisma);

  // 
  // Middleware para todas as rotas  fastify.addHook('preHandler', authPreHandler);
  fastify.addHook('preHandler', extractTenant);

  /**
   * Criar nova ordem de serviço
   */
  fastify.post('/', {
    preHandler: [
      requirePermission('orders:create'),
      createValidation({ body: createOrderSchema })
    ],
    schema: { tags: ['Orders'], body: createOrderSchema },
    handler:async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { companyId, id: userId } = request.user!;
        // 
        const order = await orderService.create(request.body as CreateOrderDTO, companyId, userId);
        
        return reply.status(201).send({
          success: true,
          data: order,
          message: 'Ordem de serviço criada com sucesso'
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Listar ordens com filtros e paginação
   */
  fastify.get('/', {
    preHandler: [
      requirePermission('orders:read'),
      createValidation({ querystring: orderFiltersSchema })
    ],
    schema: { tags: ['Orders'], querystring: orderFiltersSchema },
    handler:async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { companyId, id: userId } = request.user!;
        const result = await orderService.findMany(request.query as OrderFiltersDTO, companyId, userId);
        
        return reply.send({
          success: true,          
          data: result.orders,
          //  - Pagination typing
          pagination: {            
            page: result.page,            
            limit: result.limit,            
            total: result.total,            
            totalPages: result.totalPages
          }
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Buscar ordem por ID
   */
  fastify.get('/:id', {
    preHandler: [requirePermission('orders:read')],
    schema: { tags: ['Orders'], params: commonSchemas.idParam },
    handler:async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        //  - Params typing
        const { companyId, id: userId } = request.user as { companyId: string; id: string };
        const order = await orderService.findById((request.params as { id: string }).id, companyId, userId);
        
        return reply.send({
          success: true,
          data: order
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Atualizar ordem
   */
  fastify.put('/:id', {
    preHandler: [
      requirePermission('orders:update'),
      createValidation({ body: updateOrderSchema })
    ],
    schema: { tags: ['Orders'], params: commonSchemas.idParam, body: updateOrderSchema },
    handler:async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { companyId, id: userId } = request.user as { companyId: string; id: string };        
        const order = await orderService.update((request.params as { id: string }).id, request.body as UpdateOrderDTO, companyId, userId);
        
        return reply.send({
          success: true,
          data: order,
          message: 'Ordem de serviço atualizada com sucesso'
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Excluir ordem (soft delete)
   */
  fastify.delete('/:id', {
    preHandler: [requirePermission('orders:delete')],
    schema: { tags: ['Orders'], params: commonSchemas.idParam },
    handler:async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { companyId, id: userId } = request.user as { companyId: string; id: string };
        await orderService.delete((request.params as { id: string }).id, companyId, userId);
        
        return reply.send({
          success: true,
          message: 'Ordem de serviço excluída com sucesso'
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Restaurar ordem excluída
   */
  fastify.post('/:id/restore', {
    preHandler: [requirePermission('orders:restore')],
    schema: { tags: ['Orders'], params: commonSchemas.idParam },
    handler:async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { companyId, id: userId } = request.user!;        
        const { id } = request.params as { id: string };
        const order = await orderService.restore(id, companyId, userId);
        
        return reply.send({
          success: true,
          data: order,
          message: 'Ordem de serviço restaurada com sucesso'
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Atualizar status da ordem
   */
  fastify.patch('/:id/status', {
    preHandler: [
      requirePermission('orders:update'),
      createValidation({ body: updateOrderStatusSchema })
    ],
    handler:async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        //  - Params typing
        const { companyId, id: userId } = request.user!;        const order = await orderService.updateStatus((request.params as { id: string }).id, request.body as UpdateOrderStatusDTO, companyId, userId);
        
        return reply.send({
          success: true,
          data: order,
          message: 'Status da ordem atualizado com sucesso'
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });



  /**
   * Adicionar registro de tempo
   */
  fastify.post('/:id/time-tracking', {
    preHandler: [
      requirePermission('orders:time_tracking'),
      createValidation({ body: addOrderTimeTrackingSchema })
    ],
    handler:async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        //  - Params typing
        const { companyId, id: userId } = request.user!;        await orderService.addTimeTracking((request.params as { id: string }).id, request.body as AddOrderTimeTrackingDTO, companyId, userId);
        
        return reply.status(201).send({
          success: true,
          message: 'Registro de tempo adicionado com sucesso'
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Atualizar registro de tempo
   */
  fastify.put('/time-tracking/:timeTrackingId', {
    preHandler: [
      requirePermission('orders:time_tracking'),
      createValidation({ body: updateOrderTimeTrackingSchema })
    ],
    handler:async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        //  - Params typing
        const { companyId, id: userId } = request.user!;        await orderService.updateTimeTracking((request.params as { timeTrackingId: string }).timeTrackingId, request.body as UpdateOrderTimeTrackingDTO, companyId, userId);
        
        return reply.send({
          success: true,
          message: 'Registro de tempo atualizado com sucesso'
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Remover registro de tempo
   */
  fastify.delete('/time-tracking/:timeTrackingId', {
    preHandler: [requirePermission('orders:time_tracking')],
    handler:async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        //  - Params typing
        const { companyId, id: userId } = request.user!;        await orderService.removeTimeTracking((request.params as { timeTrackingId: string }).timeTrackingId, companyId, userId);
        
        return reply.send({
          success: true,
          message: 'Registro de tempo removido com sucesso'
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Adicionar despesa
   */
  fastify.post('/:id/expenses', {
    preHandler: [
      requirePermission('orders:expenses'),
      createValidation({ body: addOrderExpenseSchema })
    ],
    handler:async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        //  - Params typing
        const { companyId, id: userId } = request.user!;        await orderService.addExpense((request.params as { id: string }).id, request.body as AddOrderExpenseDTO, companyId, userId);
        
        return reply.status(201).send({
          success: true,
          message: 'Despesa adicionada com sucesso'
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Atualizar despesa
   */
  fastify.put('/expenses/:expenseId', {
    preHandler: [
      requirePermission('orders:expenses'),
      createValidation({ body: updateOrderExpenseSchema })
    ],
    handler:async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        //  - Params typing
        const { companyId, id: userId } = request.user!;        await orderService.updateExpense((request.params as { expenseId: string }).expenseId, request.body as UpdateOrderExpenseDTO, companyId, userId);
        
        return reply.send({
          success: true,
          message: 'Despesa atualizada com sucesso'
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Remover despesa
   */
  fastify.delete('/expenses/:expenseId', {
    preHandler: [requirePermission('orders:expenses')],
    handler:async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        //  - Params typing
        const { companyId, id: userId } = request.user!;        await orderService.removeExpense((request.params as { expenseId: string }).expenseId, companyId, userId);
        
        return reply.send({
          success: true,
          message: 'Despesa removida com sucesso'
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Obter estatísticas das ordens
   */
  fastify.get('/stats', {
    preHandler: [requirePermission('orders:delete')],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { companyId, id: userId } = request.user!;
        const stats = await orderService.getStats(companyId, userId);
        
        return reply.send({
          success: true,
          data: stats
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Gerar relatório de ordens
   */
  fastify.get('/report', {
    preHandler: [requirePermission('orders:export')],
    handler:async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        //  - Query parameters typing
        const { companyId, id: userId } = request.user!;        const { format = 'json', ...filters } = request.query as OrderFiltersDTO & { format: string };
        const fmt: 'json' | 'csv' = format === 'csv' ? 'csv' : 'json';
        
        const report = await orderService.generateReport(filters, fmt, companyId, userId);
        
        if (fmt === 'csv') {
          reply.header('Content-Type', 'text/csv');
          reply.header('Content-Disposition', 'attachment; filename="relatorio-ordens.csv"');
          return reply.send(report);
        }
        
        return reply.send({
          success: true,
          data: report
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Obter dados para dashboard
   */
  fastify.get('/dashboard', {
    preHandler: [requirePermission('orders:dashboard')],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { companyId, id: userId } = request.user!;
        const dashboard = await orderService.getDashboard(companyId, userId);
        
        return reply.send({
          success: true,
          data: dashboard
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });
}