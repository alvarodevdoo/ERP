import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services';
import { authMiddleware, requirePermission } from '../../../shared/middlewares/auth';
import { tenantMiddleware } from '../../../shared/middlewares/tenant';
import { createValidation } from '../../../shared/middlewares/validation';
import {
  createUserDto,
  updateUserDto,
  changePasswordDto,
  userFiltersDto,
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  UserFiltersDto,
} from '../dtos';
import { AppError } from '../../../shared/errors/AppError';
import { logger } from '../../../shared/logger/index';

/**
 * Rotas do módulo de usuário
 * Implementa todos os endpoints CRUD com validações e middlewares
 */
export async function userRoutes(fastify: FastifyInstance) {
  const userService = new UserService();

  // Aplicar middlewares globais para todas as rotas
  await fastify.register(authMiddleware);
  await fastify.register(tenantMiddleware);

  /**
   * Criar usuário
   * POST /users
   */
  fastify.post<{
    Body: CreateUserDto;
  }>(
    '/',
    {
      preHandler: [
        requirePermission('user:create'),
        createValidation({ body: createUserDto }),
      ],
      schema: {
        tags: ['Users'],

        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            companyId: { type: 'string', format: 'uuid' },
            isActive: { type: 'boolean', default: true },
          },
          required: ['name', 'email', 'password', 'companyId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateUserDto }>, reply: FastifyReply) => {
      try {
        const user = await userService.create(request.body);
        return reply.code(201).send(user);
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            error: error.message,
            statusCode: error.statusCode,
          });
        }
        logger.error({ err: error }, 'Erro ao criar usuário:');
        return reply.code(500).send({
          error: 'Erro interno do servidor',
          statusCode: 500,
        });
      }
    }
  );

  /**
   * Listar usuários
   * GET /users
   */
  fastify.get<{
    Querystring: UserFiltersDto;
  }>(
    '/',
    {
      preHandler: [requirePermission('user:read')],
      schema: {
        tags: ['Users'],
        querystring: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            companyId: { type: 'string', format: 'uuid' },
            isActive: { type: 'boolean' },
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            sortBy: {
              type: 'string',
              enum: ['name', 'email', 'createdAt', 'updatedAt'],
              default: 'name',
            },
            sortOrder: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'asc',
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: UserFiltersDto }>, reply: FastifyReply) => {
      try {
        const filters = userFiltersDto.parse(request.query);
        const users = await userService.findMany(filters);
        return reply.send(users);
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            error: error.message,
            statusCode: error.statusCode,
          });
        }
        logger.error({ err: error }, 'Erro ao listar usuários:');
        return reply.code(500).send({
          error: 'Erro interno do servidor',
          statusCode: 500,
        });
      }
    }
  );

  /**
   * Buscar usuário por ID
   * GET /users/:id
   */
  fastify.get<{
    Params: { id: string };
  }>(
    '/:id',
    {
      preHandler: [requirePermission('user:read')],
      schema: {
        tags: ['Users'],

        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const user = await userService.findById(request.params.id);
        return reply.send(user);
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            error: error.message,
            statusCode: error.statusCode,
          });
        }
        logger.error({ err: error }, 'Erro ao buscar usuário:');
        return reply.code(500).send({
          error: 'Erro interno do servidor',
          statusCode: 500,
        });
      }
    }
  );

  /**
   * Atualizar usuário
   * PUT /users/:id
   */
  fastify.put<{
    Params: { id: string };
    Body: UpdateUserDto;
  }>(
    '/:id',
    {
      preHandler: [
        requirePermission('user:update'),
        createValidation({ body: updateUserDto }),
      ],
      schema: {
        tags: ['Users'],

        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            isActive: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserDto }>,
      reply: FastifyReply
    ) => {
      try {
        const user = await userService.update(request.params.id, request.body);
        return reply.send(user);
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            error: error.message,
            statusCode: error.statusCode,
          });
        }
        logger.error({ err: error }, 'Erro ao atualizar usuário:');
        return reply.code(500).send({
          error: 'Erro interno do servidor',
          statusCode: 500,
        });
      }
    }
  );

  /**
   * Alterar senha
   * PATCH /users/:id/password
   */
  fastify.patch<{
    Params: { id: string };
    Body: ChangePasswordDto;
  }>(
    '/:id/password',
    {
      preHandler: [
        requirePermission('user:update'),
        createValidation({ body: changePasswordDto }),
      ],
      schema: {
        tags: ['Users'],

        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            currentPassword: { type: 'string', minLength: 8 },
            newPassword: { type: 'string', minLength: 8 },
            confirmPassword: { type: 'string', minLength: 8 },
          },
          required: ['currentPassword', 'newPassword', 'confirmPassword'],
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: ChangePasswordDto }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await userService.changePassword(request.params.id, request.body);
        return reply.send(result);
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            error: error.message,
            statusCode: error.statusCode,
          });
        }
        logger.error({ err: error }, 'Erro ao alterar senha:');
        return reply.code(500).send({
          error: 'Erro interno do servidor',
          statusCode: 500,
        });
      }
    }
  );










}