import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { CompanyService } from '../services';
import {
  createCompanyDto,
  CreateCompanyDto,
} from '../dtos';
import { requirePermission } from '../../../shared/middlewares/auth';
import { logger } from '../../../shared/logger/index';
import { AppError } from '../../../shared/errors/AppError';
import { toJsonSchema } from '../../../shared/utils/zod-to-json-schema';

/**
 * Rotas para operações de empresa
 * Implementa todos os endpoints CRUD com validações e middlewares
 */
export async function companyRoutes(fastify: FastifyInstance) {
  const companyService = new CompanyService();

  /**
   * POST /companies
   * Cria uma nova empresa
   */
  fastify.post<{
    Body: CreateCompanyDto;
  }>(
    '/',
    {
      preHandler: [requirePermission('companies:create')],
      schema: {
        tags: ['Companies'],
        body: toJsonSchema(createCompanyDto)
      },
    },
    async (request, reply: FastifyReply) => {
      try {
        const company = await companyService.create(request.body);

        return reply.status(201).send({
          success: true,
          message: 'Empresa criada com sucesso',
          data: company,
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message,
          });
        }

        logger.error(error, 'Erro ao criar empresa');
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    },
  );

  /**
   * GET /companies/all
   * Lista todas as empresas sem filtros ou paginação
   */
  fastify.get(
    '/all',
    {
      preHandler: [requirePermission('companies:read')],
      schema: {
        tags: ['Companies']
      },
    },
    async (request, reply: FastifyReply) => {
      try {
        const result = await companyService.findMany({
          page: 1,
          limit: 1000,
          sortBy: 'name',
          sortOrder: 'asc',
        }); // Default pagination to fetch all (up to 1000)

        return reply.send(result);
      } catch (error) {
        logger.error(error, 'Erro ao listar todas as empresas');
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    },
  );

  /**
   * GET /companies
   * Lista empresas com filtros e paginação
   * Remover - função sem utilidade
   */
  /**fastify.get(
    '/',
    {
      preHandler: [requirePermission('companies:read')],
      schema: {
        tags: ['Companies'],
        querystring: companyFiltersDto,
        response: {
          200: companyListResponseDto,
        },
      },
    },
    async (request: any, reply: FastifyReply): Promise<void> => {
      try {
        const result = await companyService.findMany(request.query);

        return reply.send(result);
      } catch (error) {
        logger.error(error, 'Erro ao listar empresas');
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    },
  );*/

  /**
   * GET /companies/:id
   * Busca uma empresa pelo ID
   */
  fastify.get<{
    Params: { id: string };
  }>(
    '/:id',
    {
      preHandler: [requirePermission('companies:read')],
      schema: {
        tags: ['Companies']
      },
    },
    async (request, reply: FastifyReply) => {
      try {
        const company = await companyService.findById(request.params.id);

        if (!company) {
          throw new AppError('Empresa não encontrada', 404);
        }

        return reply.send(company);
      } catch (error) {
        if (error instanceof AppError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message,
          });
        }

        logger.error(error, 'Erro ao buscar empresa por ID');
        return reply.status(500).send({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    },
  );
}