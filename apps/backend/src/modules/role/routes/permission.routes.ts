import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PermissionService } from '../services';
import { 
  createPermissionDto,
  updatePermissionDto,
  permissionFiltersDto,
} from '../dtos';
import { logger } from '../../../shared/logger/index';



export async function permissionRoutes(fastify: FastifyInstance) {
  const permissionService = new PermissionService(fastify.prisma);

  // await fastify.register(authMiddleware); // Temporarily commented out
  // await fastify.register(tenantMiddleware); // Temporarily commented out

  fastify.post('/permissions', {
    schema: {
      tags: ['Permissions'],
      body: createPermissionDto,
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof createPermissionDto> }>, reply: FastifyReply) => {
    try {
      const permission = await permissionService.create(request.body);
      logger.info({ permissionId: permission.id }, 'Permissão criada via API');
      return reply.status(201).send({ success: true, data: permission });
    } catch (error) {
      logger.error({ err: error as any }, 'Erro ao criar permissão via API');
      throw error;
    }
  });

  fastify.get('/permissions', {
    schema: {
      tags: ['Permissions'],
      querystring: permissionFiltersDto,
    },
  }, async (request: FastifyRequest<{ Querystring: z.infer<typeof permissionFiltersDto> }>, reply: FastifyReply) => {
    try {
      const result = await permissionService.findMany(request.query);
      return reply.send({ success: true, ...result });
    } catch (error) {
      logger.error({ err: error as any }, 'Erro ao listar permissões via API');
      throw error;
    }
  });

  fastify.get('/permissions/:id', {
    schema: {
      tags: ['Permissions'],
      params: z.object({ id: z.string().uuid() }),
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const permission = await permissionService.findById(request.params.id);
      return reply.send({ success: true, data: permission });
    } catch (error) {
      logger.error(error, `Erro ao buscar permissão por ID: ${request.params.id}`);
      throw error;
    }
  });

  fastify.put('/permissions/:id', {
    schema: {
      tags: ['Permissions'],
      params: z.object({ id: z.string().uuid() }),
      body: updatePermissionDto,
    },
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: z.infer<typeof updatePermissionDto> }>, reply: FastifyReply) => {
    try {
      const permission = await permissionService.update(request.params.id, request.body);
      logger.info({ permissionId: request.params.id }, 'Permissão atualizada via API');
      return reply.send({ success: true, data: permission });
    } catch (error) {
      logger.error({ err: error as any }, `Erro ao atualizar permissão: ${request.params.id}`);
      throw error;
    }
  });

  fastify.delete('/permissions/:id', {
    schema: {
      tags: ['Permissions'],
      params: z.object({ id: z.string().uuid() }),
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      await permissionService.delete(request.params.id);
      logger.info(`Permissão removida via API: ${request.params.id}`);
      return reply.status(204).send();
    } catch (error) {
      logger.error(error, `Erro ao remover permissão: ${request.params.id}`);
      throw error;
    }
  });

  fastify.get('/permissions/resources', {
    schema: { tags: ['Permissions'] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const resources = await permissionService.getUniqueResources();
      return reply.send({ success: true, data: resources });
    } catch (error) {
      logger.error({ err: error as any }, 'Erro ao obter recursos únicos de permissões');
      throw error;
    }
  });

  fastify.get('/permissions/actions', {
    schema: { tags: ['Permissions'] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const actions = await permissionService.getUniqueActions();
      return reply.send({ success: true, data: actions });
    } catch (error) {
      logger.error({ err: error as any }, 'Erro ao obter ações únicas de permissões');
      throw error;
    }
  });

  fastify.get('/permissions/grouped', {
    schema: { tags: ['Permissions'] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const grouped = await permissionService.findGroupedByResource();
      return reply.send({ success: true, data: grouped });
    } catch (error) {
      logger.error(error, 'Erro ao obter permissões agrupadas');
      throw error;
    }
  });
}
