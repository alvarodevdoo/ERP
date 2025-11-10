import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { 
  CreatePartnerDTO, 
  UpdatePartnerDTO, 
  PartnerFiltersDTO,
  createPartnerSchema,
  updatePartnerSchema,
  partnerFiltersSchema
} from '../dtos';
import type { PartnerType } from '@prisma/client';
import { PartnerService } from '../services';
import { authPreHandler } from '../../../shared/middlewares/auth';
import { tenantPreHandler } from '../../../shared/middlewares/tenant';
import { createValidation } from '../../../shared/middlewares/validation';
import { AppError } from '../../../shared/errors/AppError';

export async function partnerRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();
  const partnerService = new PartnerService(prisma);


  /**
   * Criar parceiro
   */
  fastify.post<{
    Body: CreatePartnerDTO;
  }>('/', {
    preHandler: [createValidation({ body: createPartnerSchema })],
    handler: async (request: FastifyRequest<{ Body: CreatePartnerDTO }>, reply: FastifyReply) => {
      try {
        const userId = request.userId!;
        const companyId = request.companyId!;
        const partner = await partnerService.create(request.body, userId, companyId);
        
        return reply.code(201).send({
          success: true,
          data: partner,
          message: 'Parceiro criado com sucesso'
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Listar parceiros com filtros
   */
  fastify.get<{
    Querystring: PartnerFiltersDTO;
  }>('/', {
    preHandler: [createValidation({ querystring: partnerFiltersSchema })],
    handler: async (request: FastifyRequest<{ Querystring: PartnerFiltersDTO }>, reply: FastifyReply) => {
      try {
        const userId = request.userId!;
        const companyId = request.companyId!;
        const result = await partnerService.findMany(request.query, userId, companyId);
        
        return reply.send({
          success: true,
          data: result.partners,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
          }
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Buscar parceiro por ID
   */
  fastify.get<{
    Params: { id: string };
  }>('/:id', {
    handler: async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const userId = request.userId!;
        const companyId = request.companyId!;
        const partner = await partnerService.findById(request.params.id, userId, companyId);
        
        return reply.send({
          success: true,
          data: partner
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Atualizar parceiro
   */
  fastify.put<{
    Params: { id: string };
    Body: UpdatePartnerDTO;
  }>('/:id', {
    preHandler: [createValidation({ body: updatePartnerSchema })],
    handler: async (request: FastifyRequest<{ Params: { id: string }; Body: UpdatePartnerDTO }>, reply: FastifyReply) => {
      try {
        const userId = request.userId!;
        const companyId = request.companyId!;
        const partner = await partnerService.update(request.params.id, request.body, userId, companyId);
        
        return reply.send({
          success: true,
          data: partner,
          message: 'Parceiro atualizado com sucesso'
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Excluir parceiro (soft delete)
   */
  fastify.delete<{
    Params: { id: string };
  }>('/:id', {
    handler: async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const userId = request.userId!;
        const companyId = request.companyId!;
        await partnerService.delete(request.params.id, userId, companyId);
        
        return reply.code(204).send();
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Restaurar parceiro
   */
  fastify.patch<{
    Params: { id: string };
  }>('/:id/restore', {
    handler: async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const userId = request.userId!;
        const companyId = request.companyId!;
        const partner = await partnerService.restore(request.params.id, userId, companyId);
        
        return reply.send({
          success: true,
          data: partner,
          message: 'Parceiro restaurado com sucesso'
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Buscar parceiros por tipo
   */
  fastify.get<{
    Params: { type: string };
  }>('/type/:type', {
    handler: async (request: FastifyRequest<{ Params: { type: string } }>, reply: FastifyReply) => {
      try {
        const userId = request.userId!;
        const companyId = request.companyId!;
        const result = await partnerService.findByType(request.params.type as PartnerType, userId, companyId);
        
        return reply.send({
          success: true,
          data: result
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Obter estatísticas de parceiros
   */
  fastify.get('/stats', {
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.userId!;
        const companyId = request.companyId!;
        const stats = await partnerService.getStats(userId, companyId);
        
        return reply.send({
          success: true,
          data: stats
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Verificar disponibilidade de documento
   */
  fastify.get<{
    Querystring: { document: string; excludeId?: string };
  }>('/check-document', {
    handler: async (request: FastifyRequest<{ Querystring: { document: string; excludeId?: string } }>, reply: FastifyReply) => {
      try {
        const userId = request.userId!;
        const companyId = request.companyId!;
        const { document, excludeId } = request.query;
        
        if (!document) {
          return reply.code(400).send({
            success: false,
            message: 'Documento é obrigatório'
          });
        }
        
        const result = await partnerService.checkDocumentAvailability(document, userId, companyId, excludeId);
        
        return reply.send({
          success: true,
          data: result
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Atualizar status do parceiro
   */
  fastify.patch<{
    Params: { id: string };
    Body: { isActive: boolean };
  }>('/:id/status', {
    handler: async (request: FastifyRequest<{ Params: { id: string }; Body: { isActive: boolean } }>, reply: FastifyReply) => {
      try {
        const userId = request.userId!;
        const companyId = request.companyId!;
        const { isActive } = request.body;
        
        if (typeof isActive !== 'boolean') {
          return reply.code(400).send({
            success: false,
            message: 'isActive é obrigatório como boolean'
          });
        }
        
        const partner = await partnerService.updateStatus(request.params.id, isActive, userId, companyId);
        
        return reply.send({
          success: true,
          data: partner,
          message: 'Status do parceiro atualizado com sucesso'
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });

  /**
   * Gerar relatório de parceiros
   */
  fastify.get<{
    Querystring: PartnerFiltersDTO & { format?: 'json' | 'csv' };
  }>('/report', {
    handler: async (request: FastifyRequest<{ Querystring: PartnerFiltersDTO & { format?: 'json' | 'csv' } }>, reply: FastifyReply) => {
      try {
        const userId = request.userId!;
        const companyId = request.companyId!;
        const { format = 'json', ...filters } = request.query;
        
        const report = await partnerService.generateReport(filters, userId, companyId, format);
        
        if (format === 'csv') {
          return reply
            .header('Content-Type', 'text/csv')
            .header('Content-Disposition', 'attachment; filename="partners-report.csv"')
            .send(report);
        }
        
        return reply.send({
          success: true,
          data: report
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            success: false,
            message: error.message
          });
        }
        
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  });
}