import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  CreateTransactionDTO,
  UpdateTransactionDTO,
  PayTransactionDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CreateAccountDTO,
  UpdateAccountDTO,
  CreateTransferDTO,
  TransactionFiltersDTO,
  CategoryFiltersDTO,
  AccountFiltersDTO,
  TransferFiltersDTO,
  createTransactionSchema,
  updateTransactionSchema,
  payTransactionSchema,
  createCategorySchema,
  updateCategorySchema,
  createAccountSchema,
  updateAccountSchema,
  createTransferSchema,
  transactionFiltersSchema,
  categoryFiltersSchema,
  accountFiltersSchema,
  transferFiltersSchema
} from '../dtos';
import { FinancialService } from '../services';
import { requirePermission, authMiddleware } from '../../../shared/middlewares/auth';
import { createValidation } from '../../../shared/middlewares/validation';

import { PrismaClient } from '@prisma/client';

export async function financialRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();
  const financialService = new FinancialService(prisma);

  // Middleware de autenticação será aplicado via requirePermission em cada rota

  // Rotas para transações financeiras
  
  // Criar transação
  fastify.post('/transactions', {
    preHandler: [
      requirePermission('financial:create'),
      createValidation({ body: createTransactionSchema })
    ]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const transaction = await financialService.createTransaction(
        request.body,
        request.user.id,
        request.user.companyId
      );

      return reply.code(201).send({
        success: true,
        data: transaction,
        message: 'Transação criada com sucesso'
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Listar transações com filtros
  fastify.get('/transactions', {
    preHandler: [
      requirePermission('financial:read'),
      createValidation({ querystring: transactionFiltersSchema })
    ]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const result = await financialService.findTransactions(
        request.query,
        request.user.id,
        request.user.companyId
      );

      return reply.send({
        success: true,
        data: result.transactions,
        pagination: {
          total: result.total,
          totalPages: result.totalPages,
          page: request.query.page || 1,
          limit: request.query.limit || 20
        }
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Buscar transação por ID
  fastify.get('/transactions/:id', {
    preHandler: [requirePermission('financial:read')]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const transaction = await financialService.findTransactionById(
        request.params.id,
        request.user.id,
        request.user.companyId
      );

      return reply.send({
        success: true,
        data: transaction
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Atualizar transação
  fastify.put('/transactions/:id', {
    preHandler: [
      requirePermission('financial:update'),
      createValidation({ body: updateTransactionSchema })
    ]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const transaction = await financialService.updateTransaction(
        request.params.id,
        request.body,
        request.user.id,
        request.user.companyId
      );

      return reply.send({
        success: true,
        data: transaction,
        message: 'Transação atualizada com sucesso'
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Pagar transação
  fastify.patch('/transactions/:id/pay', {
    preHandler: [
      requirePermission('financial:update'),
      createValidation({ body: payTransactionSchema })
    ]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const transaction = await financialService.payTransaction(
        request.params.id,
        request.body,
        request.user.id,
        request.user.companyId
      );

      return reply.send({
        success: true,
        data: transaction,
        message: 'Transação paga com sucesso'
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Excluir transação
  fastify.delete('/transactions/:id', {
    preHandler: [requirePermission('financial:delete')]
  }, async (request: any, reply: FastifyReply) => {
    try {
      await financialService.deleteTransaction(
        request.params.id,
        request.user.id,
        request.user.companyId
      );

      return reply.send({
        success: true,
        message: 'Transação excluída com sucesso'
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Rotas para categorias financeiras
  
  // Criar categoria
  fastify.post('/categories', {
    preHandler: [
      requirePermission('financial:create'),
      createValidation({ body: createCategorySchema })
    ]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const category = await financialService.createCategory(
        request.body,
        request.user.id,
        request.user.companyId
      );

      return reply.code(201).send({
        success: true,
        data: category,
        message: 'Categoria criada com sucesso'
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Listar categorias com filtros
  fastify.get('/categories', {
    preHandler: [
      requirePermission('financial:read'),
      createValidation({ querystring: categoryFiltersSchema })
    ]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const result = await financialService.findCategories(
        request.query,
        request.user.id,
        request.user.companyId
      );

      return reply.send({
        success: true,
        data: result.categories,
        pagination: {
          total: result.total,
          totalPages: result.totalPages,
          page: request.query.page || 1,
          limit: request.query.limit || 20
        }
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Buscar categoria por ID
  fastify.get('/categories/:id', {
    preHandler: [requirePermission('financial:read')]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const category = await financialService.findCategoryById(
        request.params.id,
        request.user.id,
        request.user.companyId
      );

      return reply.send({
        success: true,
        data: category
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Atualizar categoria
  fastify.put('/categories/:id', {
    preHandler: [
      requirePermission('financial:update'),
      createValidation({ body: updateCategorySchema })
    ]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const category = await financialService.updateCategory(
        request.params.id,
        request.body,
        request.user.id,
        request.user.companyId
      );

      return reply.send({
        success: true,
        data: category,
        message: 'Categoria atualizada com sucesso'
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Excluir categoria
  fastify.delete('/categories/:id', {
    preHandler: [requirePermission('financial:delete')]
  }, async (request: any, reply: FastifyReply) => {
    try {
      await financialService.deleteCategory(
        request.params.id,
        request.user.id,
        request.user.companyId
      );

      return reply.send({
        success: true,
        message: 'Categoria excluída com sucesso'
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Rotas para contas financeiras
  
  // Criar conta
  fastify.post('/accounts', {
    preHandler: [
      requirePermission('financial:create'),
      createValidation({ body: createAccountSchema })
    ]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const account = await financialService.createAccount(
        request.body,
        request.user.id,
        request.user.companyId
      );

      return reply.code(201).send({
        success: true,
        data: account,
        message: 'Conta criada com sucesso'
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Listar contas com filtros
  fastify.get('/accounts', {
    preHandler: [
      requirePermission('financial:read'),
      createValidation({ querystring: accountFiltersSchema })
    ]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const result = await financialService.findAccounts(
        request.query,
        request.user.id,
        request.user.companyId
      );

      return reply.send({
        success: true,
        data: result.accounts,
        pagination: {
          total: result.total,
          totalPages: result.totalPages,
          page: request.query.page || 1,
          limit: request.query.limit || 20
        }
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Buscar conta por ID
  fastify.get('/accounts/:id', {
    preHandler: [requirePermission('financial:read')]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const account = await financialService.findAccountById(
        request.params.id,
        request.user.id,
        request.user.companyId
      );

      return reply.send({
        success: true,
        data: account
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Atualizar conta
  fastify.put('/accounts/:id', {
    preHandler: [
      requirePermission('financial:update'),
      createValidation({ body: updateAccountSchema })
    ]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const account = await financialService.updateAccount(
        request.params.id,
        request.body,
        request.user.id,
        request.user.companyId
      );

      return reply.send({
        success: true,
        data: account,
        message: 'Conta atualizada com sucesso'
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Excluir conta
  fastify.delete('/accounts/:id', {
    preHandler: [requirePermission('financial:delete')]
  }, async (request: any, reply: FastifyReply) => {
    try {
      await financialService.deleteAccount(
        request.params.id,
        request.user.id,
        request.user.companyId
      );

      return reply.send({
        success: true,
        message: 'Conta excluída com sucesso'
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Rotas para transferências
  
  // Criar transferência
  fastify.post('/transfers', {
    preHandler: [
      requirePermission('financial:create'),
      createValidation({ body: createTransferSchema })
    ]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const transfer = await financialService.createTransfer(
        request.body,
        request.user.id,
        request.user.companyId
      );

      return reply.code(201).send({
        success: true,
        data: transfer,
        message: 'Transferência criada com sucesso'
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Listar transferências com filtros
  fastify.get('/transfers', {
    preHandler: [
      requirePermission('financial:read'),
      createValidation({ querystring: transferFiltersSchema })
    ]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const result = await financialService.findTransfers(
        request.query,
        request.user.id,
        request.user.companyId
      );

      return reply.send({
        success: true,
        data: result.transfers,
        pagination: {
          total: result.total,
          totalPages: result.totalPages,
          page: request.query.page || 1,
          limit: request.query.limit || 20
        }
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Rotas para estatísticas e relatórios
  
  // Obter estatísticas financeiras
  fastify.get('/stats', {
    preHandler: [requirePermission('financial:read')]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const stats = await financialService.getStats(
        request.user.id,
        request.user.companyId,
        request.query.startDate,
        request.query.endDate
      );

      return reply.send({
        success: true,
        data: stats
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Obter fluxo de caixa
  fastify.get('/cash-flow', {
    preHandler: [requirePermission('financial:read')]
  }, async (request: any, reply: FastifyReply) => {
    try {
      if (!request.query.startDate || !request.query.endDate) {
        return reply.code(400).send({
          success: false,
          message: 'Data de início e fim são obrigatórias'
        });
      }

      const cashFlow = await financialService.getCashFlow(
        request.user.id,
        request.user.companyId,
        request.query.startDate,
        request.query.endDate
      );

      return reply.send({
        success: true,
        data: cashFlow
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Gerar relatório financeiro
  fastify.get('/reports', {
    preHandler: [requirePermission('financial:read')]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const { format = 'json', ...filters } = request.query;
      
      const report = await financialService.generateReport(
        filters,
        request.user.id,
        request.user.companyId,
        format
      );

      if (format === 'csv') {
        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename="relatorio-financeiro.csv"');
        return reply.send(report);
      }

      return reply.send({
        success: true,
        data: report
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });

  // Obter dados para dashboard financeiro
  fastify.get('/dashboard', {
    preHandler: [requirePermission('financial:read')]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const dashboard = await financialService.getDashboard(
        request.user.id,
        request.user.companyId
      );

      return reply.send({
        success: true,
        data: dashboard
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      return reply.code(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Erro interno do servidor'
      });
    }
  });
}