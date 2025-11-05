import { Prisma, PrismaClient } from '@prisma/client';
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
  TransactionResponseDTO,
  CategoryResponseDTO,
  AccountResponseDTO,
  TransferResponseDTO,
  FinancialStatsDTO,
  CashFlowDTO,
  FinancialReportDTO,
  FinancialDashboardDTO
} from '../dtos';
import { FinancialRepository } from '../repositories';
import { RoleService } from '../../role/services';
import { RoleRepository } from '../../role/repositories/role.repository';
import { AppError } from '../../../shared/errors/AppError';

export class FinancialService {
  private financialRepository: FinancialRepository;
  private roleService: RoleService;

  constructor(private prisma: PrismaClient) {
    this.financialRepository = new FinancialRepository(prisma);
    this.roleService = new RoleService(new RoleRepository(prisma));
  }

  // Métodos para transações financeiras
  async createTransaction(
    data: CreateTransactionDTO,
    userId: string,
    companyId: string
  ): Promise<TransactionResponseDTO> {
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'create'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para criar transações financeiras', 403);
    }

    // Removido: validações de categoria e conta (modelos não existem no schema atual)

    try {
      // Criar transação usando transação do banco
      const result = await this.prisma.$transaction(async (tx) => {
        // Criar a transação
        const transaction = await this.financialRepository.createTransaction({
          ...data,
          companyId,
          userId
        });

        // Se for parcelado, criar as parcelas
        if (data.installments > 1) {
          await this.createInstallments(tx, transaction.id, data, companyId, userId);
        }

        return transaction;
      });

      return result;
    } catch (error) {
      throw new AppError(`Erro ao criar transação: ${error}`, 500);
    }
  }

  async findTransactionById(
    id: string,
    userId: string,
    companyId: string
  ): Promise<TransactionResponseDTO> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'read'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para visualizar transações financeiras', 403);
    }

    const transaction = await this.financialRepository.findTransactionById(id, companyId);

    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    return transaction;
  }

  async findTransactions(
    filters: TransactionFiltersDTO,
    userId: string,
    companyId: string
  ): Promise<{
    transactions: TransactionResponseDTO[];
    total: number;
    totalPages: number;
  }> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'read'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para visualizar transações financeiras', 403);
    }

    return this.financialRepository.findTransactions(filters, companyId);
  }

  async updateTransaction(
    id: string,
    data: UpdateTransactionDTO,
    userId: string,
    companyId: string
  ): Promise<TransactionResponseDTO> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'update'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para atualizar transações financeiras', 403);
    }

    // Verificar se a transação existe
    const existingTransaction = await this.financialRepository.findTransactionById(id, companyId);
    if (!existingTransaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    // Removido: validações de categoria/conta baseadas em modelos não suportados

    return this.financialRepository.updateTransaction(id, data, companyId);
  }

  async payTransaction(
    id: string,
    data: PayTransactionDTO,
    userId: string,
    companyId: string
  ): Promise<TransactionResponseDTO> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'update'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para pagar transações financeiras', 403);
    }

    // Verificar se a transação existe e está pendente
    const transaction = await this.financialRepository.findTransactionById(id, companyId);
    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    if (transaction.status !== 'PENDING') {
      throw new AppError('Transação não está pendente', 400);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Atualizar a transação
        const updatedTransaction = await this.financialRepository.updateTransaction(
          id,
          {
            status: 'PAID',
            paymentDate: data.paymentDate,
            notes: data.notes
          },
          companyId
        );

        // Removido: atualização de saldo de conta (modelo de conta não existe no schema)

        return updatedTransaction;
      });
    } catch (error) {
      throw new AppError(`Erro ao pagar transação: ${error}`, 500);
    }
  }

  async deleteTransaction(
    id: string,
    userId: string,
    companyId: string
  ): Promise<void> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'delete'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para excluir transações financeiras', 403);
    }

    // Verificar se a transação existe
    const transaction = await this.financialRepository.findTransactionById(id, companyId);
    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    // Removido: reversão de saldo de conta (modelos de conta não existem no schema)
    await this.financialRepository.deleteTransaction(id, companyId);
  }

  // Métodos para categorias
  async createCategory(
    data: CreateCategoryDTO,
    userId: string,
    companyId: string
  ): Promise<CategoryResponseDTO> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'create'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para criar categorias financeiras', 403);
    }

    // Removido: validações baseadas em modelos de categoria não suportados

    return this.financialRepository.createCategory({ ...data, companyId });
  }

  async findCategoryById(
    id: string,
    userId: string,
    companyId: string
  ): Promise<CategoryResponseDTO> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'read'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para visualizar categorias financeiras', 403);
    }

    const category = await this.financialRepository.findCategoryById(id, companyId);

    if (!category) {
      throw new AppError('Categoria não encontrada', 404);
    }

    return category;
  }

  async findCategories(
    filters: CategoryFiltersDTO,
    userId: string,
    companyId: string
  ): Promise<{
    categories: CategoryResponseDTO[];
    total: number;
    totalPages: number;
  }> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'read'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para visualizar categorias financeiras', 403);
    }

    return this.financialRepository.findCategories({ ...filters, companyId });
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryDTO,
    userId: string,
    companyId: string
  ): Promise<CategoryResponseDTO> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'update'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para atualizar categorias financeiras', 403);
    }

    // Verificar se a categoria existe
    const existingCategory = await this.financialRepository.findCategoryById(id, companyId);
    if (!existingCategory) {
      throw new AppError('Categoria não encontrada', 404);
    }

    // Removido: verificação de duplicação de nome (categorias não suportadas no schema atual)

    return this.financialRepository.updateCategory(id, data, companyId);
  }

  async deleteCategory(
    id: string,
    userId: string,
    companyId: string
  ): Promise<void> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'delete'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para excluir categorias financeiras', 403);
    }

    // Verificar se a categoria existe
    const category = await this.financialRepository.findCategoryById(id, companyId);
    if (!category) {
      throw new AppError('Categoria não encontrada', 404);
    }

    // Removido: verificações baseadas em modelos não suportados no schema

    await this.financialRepository.deleteCategory(id, companyId);
  }

  // Métodos para contas
  async createAccount(
    data: CreateAccountDTO,
    userId: string,
    companyId: string
  ): Promise<AccountResponseDTO> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'create'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para criar contas financeiras', 403);
    }

    // Removido: validação baseada em modelo de conta não suportado

    return this.financialRepository.createAccount({ ...data, companyId });
  }

  async findAccountById(
    id: string,
    userId: string,
    companyId: string
  ): Promise<AccountResponseDTO> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'read'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para visualizar contas financeiras', 403);
    }

    const account = await this.financialRepository.findAccountById(id, companyId);

    if (!account) {
      throw new AppError('Conta não encontrada', 404);
    }

    return account;
  }

  async findAccounts(
    filters: AccountFiltersDTO,
    userId: string,
    companyId: string
  ): Promise<{
    accounts: AccountResponseDTO[];
    total: number;
    totalPages: number;
  }> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'read'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para visualizar contas financeiras', 403);
    }

    return this.financialRepository.findAccounts({ ...filters, companyId });
  }

  async updateAccount(
    id: string,
    data: UpdateAccountDTO,
    userId: string,
    companyId: string
  ): Promise<AccountResponseDTO> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'update'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para atualizar contas financeiras', 403);
    }

    // Verificar se a conta existe
    const existingAccount = await this.financialRepository.findAccountById(id, companyId);
    if (!existingAccount) {
      throw new AppError('Conta não encontrada', 404);
    }

    // Removido: validação baseada em modelo de conta não suportado

    return this.financialRepository.updateAccount(id, data, companyId);
  }

  async deleteAccount(
    id: string,
    userId: string,
    companyId: string
  ): Promise<void> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'delete'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para excluir contas financeiras', 403);
    }

    // Verificar se a conta existe
    const account = await this.financialRepository.findAccountById(id, companyId);
    if (!account) {
      throw new AppError('Conta não encontrada', 404);
    }

    // Removido: validações baseadas em modelos não suportados no schema

    await this.financialRepository.deleteAccount(id, companyId);
  }

  // Métodos para transferências
  async createTransfer(
    data: CreateTransferDTO,
    userId: string,
    companyId: string
  ): Promise<TransferResponseDTO> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'create'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para criar transferências', 403);
    }

    // Validar se as contas são diferentes
    if (data.fromAccountId === data.toAccountId) {
      throw new AppError('Conta de origem e destino devem ser diferentes', 400);
    }

    // Removido: validações baseadas em modelos de conta não suportados no schema atual

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Criar a transferência
        const transfer = await this.financialRepository.createTransfer({
          ...data,
          companyId,
          userId
        });

        // Removido: atualização de saldos de contas (modelos de conta não existem no schema)

        return transfer;
      });
    } catch (error) {
      throw new AppError(`Erro ao criar transferência: ${error}`, 500);
    }
  }

  async findTransfers(
    filters: TransferFiltersDTO,
    userId: string,
    companyId: string
  ): Promise<{
    transfers: TransferResponseDTO[];
    total: number;
    totalPages: number;
  }> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'read'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para visualizar transferências', 403);
    }

    return this.financialRepository.findTransfers({ ...filters, companyId });
  }

  // Métodos para estatísticas e relatórios
  async getStats(
    userId: string,
    companyId: string,
    startDate?: string,
    endDate?: string
  ): Promise<FinancialStatsDTO> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'read'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para visualizar estatísticas financeiras', 403);
    }

    return this.financialRepository.getStats(companyId, startDate, endDate);
  }

  async getCashFlow(
    userId: string,
    companyId: string,
    startDate: string,
    endDate: string
  ): Promise<CashFlowDTO[]> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'read'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para visualizar fluxo de caixa', 403);
    }

    return this.financialRepository.getCashFlow(companyId, startDate, endDate);
  }

  async generateReport(
    filters: Record<string, unknown>,
    userId: string,
    companyId: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<FinancialReportDTO[] | string> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'read'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para gerar relatórios financeiros', 403);
    }

    const data = await this.financialRepository.findForReport(companyId, filters);

    if (format === 'csv') {
      return this.convertToCSV(data);
    }

    return data;
  }

  async getDashboard(
    userId: string,
    companyId: string
  ): Promise<FinancialDashboardDTO> {
    // Verificar permissões
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource: 'financial',
      permission: 'read'
    });

    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para visualizar dashboard financeiro', 403);
    }

    try {
      const [stats, recentTransactions, overdueTransactions, upcomingTransactions] = await Promise.all([
        this.financialRepository.getStats(companyId),
        // 
        this.financialRepository.findTransactions({
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }, companyId),
        // 
        this.financialRepository.findTransactions({
          status: 'OVERDUE',
          page: 1,
          limit: 10,
          sortBy: 'dueDate',
          sortOrder: 'asc'
        }, companyId),
        // 
        this.financialRepository.findTransactions({
          status: 'PENDING',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Próximos 30 dias
          page: 1,
          limit: 10,
          sortBy: 'dueDate',
          sortOrder: 'asc'
        }, companyId)
      ]);

      // Calcular fluxo de caixa dos últimos 12 meses
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);
      const cashFlow = await this.financialRepository.getCashFlow(
        companyId,
        startDate.toISOString(),
        new Date().toISOString()
      );

      // Calcular comparação mensal
      const monthlyComparison = await this.calculateMonthlyComparison(companyId);

      return {
        stats,
        cashFlow,
        recentTransactions: recentTransactions.transactions,
        overdueTransactions: overdueTransactions.transactions,
        upcomingTransactions: upcomingTransactions.transactions,
        accountsBalance: [],
        monthlyComparison
      };
    } catch (error) {
      throw new AppError(`Erro ao obter dashboard: ${error}`, 500);
    }
  }

  // Métodos auxiliares
  private async createInstallments(
    tx: Prisma.TransactionClient,
    transactionId: string,
    data: CreateTransactionDTO,
    companyId: string,
    userId: string
  ): Promise<void> {
    const installmentAmount = data.amount / data.installments;
    const dueDate = new Date(data.dueDate);

    for (let i = 2; i <= data.installments; i++) {
      const installmentDueDate = new Date(dueDate);
      installmentDueDate.setMonth(installmentDueDate.getMonth() + (i - 1));

      await tx.financialEntry.create({
        data: {
          type: data.type,
          status: 'PENDING',
          category: (data as any).categoryId || 'Geral',
          description: `${data.description} - Parcela ${i}/${data.installments}`,
          amount: installmentAmount,
          dueDate: installmentDueDate,
          userId,
          reference: (data as any).referenceId || null,
          notes: data.notes || null,
          companyId
        }
      });
    }
  }

  // Removido: updateAccountBalance (modelo de conta não existe no schema)

  private async calculateMonthlyComparison(companyId: string): Promise<Array<{
    month: string;
    income: number;
    expense: number;
    netIncome: number;
  }>> {
    const months = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);

      const nextMonth = new Date(date);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const transactions = await this.prisma.financialEntry.findMany({
        where: {
          companyId,
          status: 'PAID',
          paidDate: {
            gte: date,
            lt: nextMonth
          }
        }
      });

      const income = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number((t as any).amount?.toNumber ? (t as any).amount.toNumber() : t.amount), 0);

      const expense = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number((t as any).amount?.toNumber ? (t as any).amount.toNumber() : t.amount), 0);

      months.push({
        month: date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' }),
        income,
        expense,
        netIncome: income - expense
      });
    }

    return months;
  }

  private convertToCSV(data: FinancialReportDTO[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  }
}