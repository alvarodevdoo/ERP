import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { RoleService } from '../services';
import { RoleRepository } from '../repositories/role.repository';
import { createRoleDto, updateRoleDto, roleFiltersDto, checkPermissionDto } from '../dtos';
import { logger } from '../../../shared/logger/index';

// Define a custom request type if you have authentication middleware that adds user to the request


export async function roleRoutes(fastify: FastifyInstance) {
  const roleRepository = new RoleRepository(fastify.prisma);
  const roleService = new RoleService(roleRepository);

  // fastify.addHook('preHandler', authMiddleware); // Temporarily commented out

  fastify.post('/', {
    schema: {
      tags: ['Roles'],
      body: createRoleDto,
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof createRoleDto> }>, reply: FastifyReply) => {
    try {
      const role = await roleService.create(request.body);
      return reply.status(201).send(role);
    } catch (error) {
      logger.error(error, 'Erro ao criar role via API');
      throw error;
    }
  });

  fastify.get('/:id', {
    schema: { 
      tags: ['Roles'],
      params: z.object({ id: z.string().uuid() }),
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const role = await roleService.findById(request.params.id);
      return reply.send(role);
    } catch (error) {
      logger.error(error, `Erro ao buscar role por ID via API: ${request.params.id}`);
      throw error;
    }
  });

  fastify.get('/', {
    schema: {
      tags: ['Roles'],
      querystring: roleFiltersDto,
    },
  }, async (request: FastifyRequest<{ Querystring: z.infer<typeof roleFiltersDto> }>, reply: FastifyReply) => {
    try {
      const roles = await roleService.findMany(request.query);
      return reply.send(roles);
    } catch (error) {
      logger.error(error, 'Erro ao listar roles via API');
      throw error;
    }
  });

  fastify.put('/:id', {
    schema: {
      tags: ['Roles'],
      params: z.object({ id: z.string().uuid() }),
      body: updateRoleDto,
    },
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: z.infer<typeof updateRoleDto> }>, reply: FastifyReply) => {
    try {
      const role = await roleService.update(request.params.id, request.body);
      return reply.send(role);
    } catch (error) {
      logger.error(error, `Erro ao atualizar role via API: ${request.params.id}`);
      throw error;
    }
  });

  fastify.delete('/:id', {
    schema: {
      tags: ['Roles'],
      params: z.object({ id: z.string().uuid() }),
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      await roleService.delete(request.params.id);
      return reply.status(204).send();
    } catch (error) {
      logger.error(error, `Erro ao remover role via API: ${request.params.id}`);
      throw error;
    }
  });

  fastify.post('/check-permission', {
    schema: {
      tags: ['Roles'],
      body: checkPermissionDto,
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof checkPermissionDto> }>, reply: FastifyReply) => {
    try {
      const result = await roleService.checkPermission(request.body);
      return reply.send(result);
    } catch (error) {
      logger.error(error, 'Erro ao verificar permissão do usuário via API');
      throw error;
    }
  });

  fastify.get('/stats', {
    schema: { tags: ['Roles'] }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = await roleService.getStats(request.user!.companyId);
      return reply.send(stats);
    } catch (error) {
      logger.error(error, 'Erro ao obter estatísticas de roles via API');
      throw error;
    }
  });
}
