import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductFiltersDto,
  createProductDto,
  updateProductDto,
  productFiltersDto
} from '../dtos';
import { ProductService } from '../services';
import { toJsonSchema } from '../../../shared/utils/zod-to-json-schema';

function handleError(error: unknown, reply: FastifyReply) {
  const statusCode = error instanceof Error && 'statusCode' in error ? (error as { statusCode: number }).statusCode : 500;
  const message = error instanceof Error ? error.message : 'Erro interno do servidor';

  if (error instanceof Error) {
    reply.log.error({ 
      message: error.message, 
      stack: error.stack, 
      statusCode: (error as any).statusCode,
      isOperational: (error as any).isOperational
    }, 'Erro capturado no handler de rota:');
  } else {
    reply.log.error({ error }, 'Erro desconhecido capturado no handler de rota:');
  }
  
  return reply.code(statusCode).send({
    success: false,
    message
  });
}

export async function productRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();
  const productService = new ProductService(prisma);

  fastify.post<{ Body: CreateProductDto }>(
    '/',
    {
      schema: {
        tags: ['Products'],
        description: 'Criar novo produto',
        body: toJsonSchema(createProductDto)
      }
    },
    async (request: FastifyRequest<{ Body: CreateProductDto }>, reply: FastifyReply) => {
      try {
        const { companyId, userId } = request;
        if (!companyId || !userId) {
          return reply.code(400).send({ success: false, message: 'companyId e userId são obrigatórios' });
        }
        const product = await productService.create(request.body, companyId, userId);
        return reply.code(201).send({ success: true, data: product, message: 'Produto criado com sucesso' });
      } catch (error: unknown) {
        return handleError(error, reply);
      }
    }
  );

  fastify.get<{ Querystring: ProductFiltersDto }>(
    '/',
    {
      schema: { 
        tags: ['Products'],
        querystring: toJsonSchema(productFiltersDto)
      }
    },
    async (request: FastifyRequest<{ Querystring: ProductFiltersDto }>, reply: FastifyReply) => {
      try {
        const { companyId, userId } = request;
        reply.log.info({ query: request.query }, 'Filtros recebidos');
        const result = await productService.findMany(request.query, companyId, userId);
        return reply.send({
          success: true,
          data: result.products,
          meta: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages }
        });
      } catch (error: unknown) {
        reply.log.error({ error, query: request.query }, 'Erro ao buscar produtos');
        return handleError(error, reply);
      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    { schema: { tags: ['Products'] } },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { companyId, userId } = request;
        if (!companyId || !userId) {
          return reply.code(400).send({ success: false, message: 'companyId e userId são obrigatórios' });
        }
        const product = await productService.findById(request.params.id, companyId, userId);
        if (!product) {
          return reply.code(404).send({ success: false, message: 'Produto não encontrado' });
        }
        return reply.send({ success: true, data: product });
      } catch (error: unknown) {
        return handleError(error, reply);
      }
    }
  );

  fastify.put<{ Params: { id: string }; Body: UpdateProductDto }>(
    '/:id',
    {
      schema: {
        tags: ['Products'],
        description: 'Atualizar produto',
        body: toJsonSchema(updateProductDto)
      }
    },
    async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateProductDto }>, reply: FastifyReply) => {
      try {
        const { companyId, userId } = request;
        if (!companyId || !userId) {
          return reply.code(400).send({ success: false, message: 'companyId e userId são obrigatórios' });
        }
        const product = await productService.update(request.params.id, request.body, companyId, userId);
        return reply.send({ success: true, data: product, message: 'Produto atualizado com sucesso' });
      } catch (error: unknown) {
        return handleError(error, reply);
      }
    }
  );

  fastify.patch<{ Params: { id: string }; Body: UpdateProductDto }>(
    '/:id',
    {
      schema: {
        tags: ['Products'],
        description: 'Atualizar parcialmente produto',
        body: toJsonSchema(updateProductDto)
      }
    },
    async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateProductDto }>, reply: FastifyReply) => {
      try {
        const { companyId, userId } = request;
        if (!companyId || !userId) {
          return reply.code(400).send({ success: false, message: 'companyId e userId são obrigatórios' });
        }
        const product = await productService.update(request.params.id, request.body, companyId, userId);
        return reply.send({ success: true, data: product, message: 'Produto atualizado parcialmente com sucesso' });
      } catch (error: unknown) {
        return handleError(error, reply);
      }
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    { schema: { tags: ['Products'] } },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { companyId, userId } = request;
        if (!companyId || !userId) {
          return reply.code(400).send({ success: false, message: 'companyId e userId são obrigatórios' });
        }
        await productService.delete(request.params.id, companyId, userId);
        return reply.send({ success: true, message: 'Produto excluído com sucesso' });
      } catch (error: unknown) {
        return handleError(error, reply);
      }
    }
  );

  fastify.patch<{ Params: { id: string } }>(
    '/:id/restore',
    { schema: { tags: ['Products'] } },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { companyId, userId } = request;
        if (!companyId || !userId) {
          return reply.code(400).send({ success: false, message: 'companyId e userId são obrigatórios' });
        }
        const product = await productService.restore(request.params.id, companyId, userId);
        return reply.send({ success: true, data: product, message: 'Produto restaurado com sucesso' });
      } catch (error: unknown) {
        return handleError(error, reply);
      }
    }
  );

  fastify.get<{ Params: { categoryId: string }; Querystring: { page?: number; limit?: number; includeSubcategories?: boolean } }>(
    '/category/:categoryId',
    { schema: { tags: ['Products'] } },
    async (request: FastifyRequest<{ Params: { categoryId: string }; Querystring: { page?: number; limit?: number; includeSubcategories?: boolean } }>, reply: FastifyReply) => {
      try {
        const { companyId, userId } = request;
        if (!companyId || !userId) {
          return reply.code(400).send({ success: false, message: 'companyId e userId são obrigatórios' });
        }
        const products = await productService.findByCategory(request.params.categoryId, companyId, userId);
        return reply.send({ success: true, data: products });
      } catch (error: unknown) {
        return handleError(error, reply);
      }
    }
  );

  fastify.get('/low-stock', { schema: { tags: ['Products'] } }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { companyId, userId } = request;
      if (!companyId || !userId) {
        return reply.code(400).send({ success: false, message: 'companyId e userId são obrigatórios' });
      }
      const products = await productService.findLowStock(companyId, userId);
      return reply.send({ success: true, data: products });
    } catch (error: unknown) {
      return handleError(error, reply);
    }
  });

  fastify.get('/out-of-stock', { schema: { tags: ['Products'] } }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { companyId, userId } = request;
      if (!companyId || !userId) {
        return reply.code(400).send({ success: false, message: 'companyId e userId são obrigatórios' });
      }
      const products = await productService.findOutOfStock(companyId, userId);
      return reply.send({ success: true, data: products });
    } catch (error: unknown) {
      return handleError(error, reply);
    }
  });

  fastify.get('/stats', { schema: { tags: ['Products'] } }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { companyId, userId } = request;
      if (!companyId || !userId) {
        return reply.code(400).send({ success: false, message: 'companyId e userId são obrigatórios' });
      }
      const stats = await productService.getStats(companyId, userId);
      return reply.send({ success: true, data: stats });
    } catch (error: unknown) {
      return handleError(error, reply);
    }
  });

  fastify.patch<{ Params: { id: string }; Body: { stock: number } }>(
    '/:id/stock',
    {
      schema: {
        tags: ['Products'],
        body: {
          type: 'object',
          required: ['stock'],
          properties: {
            stock: { type: 'number' }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Params: { id: string }; Body: { stock: number } }>, reply: FastifyReply) => {
      try {
        const { companyId, userId } = request;
        if (!companyId || !userId) {
          return reply.code(400).send({ success: false, message: 'companyId e userId são obrigatórios' });
        }
        const { stock } = request.body;
        if (typeof stock !== 'number' || stock < 0) {
          return reply.code(400).send({ success: false, message: 'Estoque deve ser um número não negativo' });
        }
        const product = await productService.updateStock(request.params.id, stock, companyId, userId);
        return reply.send({ success: true, data: product, message: 'Estoque atualizado com sucesso' });
      } catch (error: unknown) {
        return handleError(error, reply);
      }
    }
  );

  fastify.post<{ Params: { id: string }; Body: { adjustment: number; reason: string } }>(
    '/:id/adjust-stock',
    {
      schema: {
        tags: ['Products'],
        body: {
          type: 'object',
          required: ['adjustment', 'reason'],
          properties: {
            adjustment: { type: 'number' },
            reason: { type: 'string' }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Params: { id: string }; Body: { adjustment: number; reason: string } }>, reply: FastifyReply) => {
      try {
        const { companyId, userId } = request;
        if (!companyId || !userId) {
          return reply.code(400).send({ success: false, message: 'companyId e userId são obrigatórios' });
        }
        const { adjustment, reason } = request.body;
        if (typeof adjustment !== 'number' || adjustment === 0) {
          return reply.code(400).send({ success: false, message: 'Ajuste deve ser um número diferente de zero' });
        }
        if (!reason || reason.trim().length < 3) {
          return reply.code(400).send({ success: false, message: 'Motivo do ajuste é obrigatório e deve ter pelo menos 3 caracteres' });
        }
        const result = await productService.adjustStock(request.params.id, adjustment, reason, companyId, userId);
        return reply.send({ success: true, data: result, message: 'Estoque ajustado com sucesso' });
      } catch (error: unknown) {
        return handleError(error, reply);
      }
    }
  );

  fastify.get<{ Querystring: { sku: string; excludeId?: string } }>(
    '/check-sku',
    { schema: { tags: ['Products'] } },
    async (request: FastifyRequest<{ Querystring: { sku: string; excludeId?: string } }>, reply: FastifyReply) => {
      try {
        const { companyId, userId } = request;
        if (!companyId || !userId) {
          return reply.code(400).send({ success: false, message: 'companyId e userId são obrigatórios' });
        }
        const { sku, excludeId } = request.query;
        if (!sku) {
          return reply.code(400).send({ success: false, message: 'SKU é obrigatório' });
        }
        const result = await productService.checkSkuAvailability(sku, companyId, excludeId);
        return reply.send({ success: true, data: result });
      } catch (error: unknown) {
        return handleError(error, reply);
      }
    }
  );

  fastify.get<{ Querystring: { categoryId?: string; active?: boolean; trackStock?: boolean; lowStock?: boolean; outOfStock?: boolean; format?: 'json' | 'csv' } }>(
    '/report',
    { schema: { tags: ['Products'] } },
    async (request: FastifyRequest<{ Querystring: { categoryId?: string; active?: boolean; trackStock?: boolean; lowStock?: boolean; outOfStock?: boolean; format?: 'json' | 'csv' } }>, reply: FastifyReply) => {
      try {
        const { companyId, userId } = request;
        if (!companyId || !userId) {
          return reply.code(400).send({ success: false, message: 'companyId e userId são obrigatórios' });
        }
        const { categoryId, active, lowStock, format } = request.query;
        const filters: ProductFiltersDto = {
          page: 1,
          limit: 100,
          sortBy: 'name',
          sortOrder: 'asc',
          ...(categoryId ? { categoryId } : {}),
          ...(active !== undefined ? { isActive: active } : {}),
          ...(lowStock !== undefined ? { lowStock } : {})
        };
        const report = await productService.findForReport(filters, companyId, userId);
        if (format === 'csv') {
          reply.header('Content-Type', 'text/csv');
          reply.header('Content-Disposition', 'attachment; filename="produtos.csv"');
          return reply.send(report);
        }
        return reply.send({ success: true, data: report });
      } catch (error: unknown) {
        return handleError(error, reply);
      }
    }
  );
}
