import { PrismaClient, Prisma } from '@prisma/client';
import {
  TransactionResponseDTO,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFiltersDTO,
  CategoryFiltersDTO,
  AccountFiltersDTO,
  TransferFiltersDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CreateAccountDTO,
  UpdateAccountDTO,
  CreateTransferDTO,
  CategoryResponseDTO,
  AccountResponseDTO,
  TransferResponseDTO,
  FinancialStatsDTO,
  CashFlowDTO,
  FinancialReportDTO
} from '../dtos';

// Tipo para transação com includes do Prisma
type TransactionWithIncludes = Prisma.FinancialEntryGetPayload<{
  include: {
    company: true;
    partner: true;
    order: true;
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

export class FinancialRepository {
  constructor(private prisma: PrismaClient) {}

  // Métodos para transações financeiras
  async createTransaction(
    data: CreateTransactionDTO & { companyId: string; userId: string },
    tx?: Prisma.TransactionClient
  ): Promise<TransactionResponseDTO> {
    try {
      const prisma = tx || this.prisma;
      const transaction = await prisma.financialEntry.create({
        data: {
          type: data.type,
          status: 'PENDING',
          category: (data as any).categoryId || 'Geral',
          description: data.description,
          amount: data.amount,
          dueDate: new Date(data.dueDate),
          paidDate: data.paymentDate ? new Date(data.paymentDate) : null,
          userId: data.userId,
          reference: (data as any).referenceId || null,
          notes: data.notes || null,
          companyId: data.companyId
        },
        include: {
          company: true,
          partner: true,
          order: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return this.mapTransactionToResponse(transaction);
    } catch (error) {
      throw new Error(`Erro ao criar transação: ${(error as Error).message}`);
    }
  }

  async findTransactionById(id: string, companyId: string): Promise<TransactionResponseDTO | null> {
    try {
      const transaction = await this.prisma.financialEntry.findFirst({
        where: { id, companyId },
        include: {
          company: true,
          partner: true,
          order: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return transaction ? this.mapTransactionToResponse(transaction) : null;
    } catch (error) {
      throw new Error(`Erro ao buscar transação: ${(error as Error).message}`);
    }
  }

  async findTransactions(filters: TransactionFiltersDTO, companyId: string): Promise<{ transactions: TransactionResponseDTO[]; total: number; totalPages: number; }> {
    try {
      interface WhereClause {
        companyId: string;
        type?: 'INCOME' | 'EXPENSE';
        status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
        dueDate?: {
          gte?: Date;
          lte?: Date;
        };
        amount?: {
          gte?: number;
          lte?: number;
        };
        OR?: Array<{
          description?: { contains: string; mode: 'insensitive' };
          notes?: { contains: string; mode: 'insensitive' };
        }>;
      }

      const where: WhereClause = {
        companyId
      };

      if (filters.type) where.type = filters.type as 'INCOME' | 'EXPENSE';
      if (filters.status) where.status = filters.status as 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
      
      if (filters.startDate || filters.endDate) {
        where.dueDate = {};
        if (filters.startDate) where.dueDate.gte = new Date(filters.startDate);
        if (filters.endDate) where.dueDate.lte = new Date(filters.endDate);
      }

      if (filters.minAmount || filters.maxAmount) {
        where.amount = {};
        if (filters.minAmount) where.amount.gte = filters.minAmount;
        if (filters.maxAmount) where.amount.lte = filters.maxAmount;
      }

      if (filters.search) {
        where.OR = [
          { description: { contains: filters.search, mode: 'insensitive' } },
          { notes: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const [transactions, total] = await Promise.all([
        this.prisma.financialEntry.findMany({
          where,
          include: {
            company: true,
            partner: true,
            order: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: filters.sortOrder === 'asc' ? 'asc' : 'desc'
          },
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit
        }),
        this.prisma.financialEntry.count({ where })
      ]);

      return {
        transactions: transactions.map((t) => this.mapTransactionToResponse(t)),
        total,
        totalPages: Math.ceil(total / filters.limit)
      };
    } catch (error) {
      throw new Error(`Erro ao buscar transações: ${(error as Error).message}`);
    }
  }

  async updateTransaction(id: string, data: UpdateTransactionDTO, companyId: string): Promise<TransactionResponseDTO> {
    try {
      const updateData: Prisma.FinancialEntryUpdateInput = {};
      if (data.type) updateData.type = data.type;
      if (data.status) updateData.status = data.status;
      if (data.description) updateData.description = data.description;
      if (data.amount) updateData.amount = data.amount;
      if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
      if (data.paymentDate) updateData.paidDate = new Date(data.paymentDate);
      if (data.notes) updateData.notes = data.notes;
      if (data.categoryId) updateData.category = data.categoryId;
      
      const transaction = await this.prisma.financialEntry.update({
        where: { id, companyId },
        data: updateData,
        include: {
          company: true,
          partner: true,
          order: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return this.mapTransactionToResponse(transaction);
    } catch (error) {
      throw new Error(`Erro ao atualizar transação: ${(error as Error).message}`);
    }
  }

  async deleteTransaction(id: string, companyId: string, tx?: Prisma.TransactionClient): Promise<void> {
    try {
      const prisma = tx || this.prisma;
      await prisma.financialEntry.delete({
        where: { id, companyId }
      });
    } catch (error) {
      throw new Error(`Erro ao deletar transação: ${(error as Error).message}`);
    }
  }

  // Método auxiliar para mapeamento
  private mapTransactionToResponse(transaction: TransactionWithIncludes): TransactionResponseDTO {
    const amount = typeof transaction.amount === 'object' ? transaction.amount.toNumber() : transaction.amount;
    
    return {
      id: transaction.id,
      type: transaction.type as 'INCOME' | 'EXPENSE',
      categoryId: transaction.category || '',
      categoryName: transaction.category || 'Sem categoria',
      categoryColor: '#6B7280',
      accountId: '',
      accountName: '',
      amount,
      paidAmount: amount,
      description: transaction.description,
      dueDate: transaction.dueDate.toISOString(),
      ...(transaction.paidDate ? { paymentDate: transaction.paidDate.toISOString() } : {}),
      status: transaction.status as 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED',
      installments: 1,
      currentInstallment: 1,
      tags: [],
      attachments: [],
      notes: transaction.notes || '',
      referenceId: transaction.reference || '',
      referenceType: 'OTHER',
      paymentMethod: 'CASH',
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
      companyId: transaction.companyId
    };
  }

  // Categorias (não suportadas no schema atual)
  async createCategory(_data: CreateCategoryDTO & { companyId: string }): Promise<CategoryResponseDTO> {
    throw new Error('Categorias financeiras não são suportadas pelo schema atual');
  }

  async findCategoryById(_id: string, _companyId: string): Promise<CategoryResponseDTO | null> {
    throw new Error('Categorias financeiras não são suportadas pelo schema atual');
  }

  async findCategories(
    _filters: CategoryFiltersDTO & { companyId: string }
  ): Promise<{ categories: CategoryResponseDTO[]; total: number; totalPages: number; }> {
    throw new Error('Categorias financeiras não são suportadas pelo schema atual');
  }

  async updateCategory(_id: string, _data: UpdateCategoryDTO, _companyId: string): Promise<CategoryResponseDTO> {
    throw new Error('Categorias financeiras não são suportadas pelo schema atual');
  }

  async deleteCategory(_id: string, _companyId: string): Promise<void> {
    throw new Error('Categorias financeiras não são suportadas pelo schema atual');
  }

  // Contas (não suportadas no schema atual)
  async createAccount(_data: CreateAccountDTO & { companyId: string }): Promise<AccountResponseDTO> {
    throw new Error('Contas financeiras não são suportadas pelo schema atual');
  }

  async findAccountById(_id: string, _companyId: string): Promise<AccountResponseDTO | null> {
    throw new Error('Contas financeiras não são suportadas pelo schema atual');
  }

  async findAccounts(
    _filters: AccountFiltersDTO & { companyId: string }
  ): Promise<{ accounts: AccountResponseDTO[]; total: number; totalPages: number; }> {
    throw new Error('Contas financeiras não são suportadas pelo schema atual');
  }

  async updateAccount(_id: string, _data: UpdateAccountDTO, _companyId: string): Promise<AccountResponseDTO> {
    throw new Error('Contas financeiras não são suportadas pelo schema atual');
  }

  async deleteAccount(_id: string, _companyId: string): Promise<void> {
    throw new Error('Contas financeiras não são suportadas pelo schema atual');
  }

  // Transferências (não suportadas no schema atual)
  async createTransfer(_data: CreateTransferDTO & { companyId: string; userId?: string }): Promise<TransferResponseDTO> {
    throw new Error('Transferências financeiras não são suportadas pelo schema atual');
  }

  async findTransfers(
    _filters: TransferFiltersDTO & { companyId: string }
  ): Promise<{ transfers: TransferResponseDTO[]; total: number; totalPages: number; }> {
    throw new Error('Transferências financeiras não são suportadas pelo schema atual');
  }

  // Estatísticas baseadas em FinancialEntry
  async getStats(companyId: string, startDate?: string, endDate?: string): Promise<FinancialStatsDTO> {
    const where: Prisma.FinancialEntryWhereInput = {
      companyId,
      ...(startDate || endDate
        ? {
            dueDate: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) })
            }
          }
        : {})
    };

    const entries = await this.prisma.financialEntry.findMany({ where });

    const toNumber = (v: any) => (typeof v === 'object' && v !== null && 'toNumber' in v ? v.toNumber() : Number(v));

    let totalIncome = 0;
    let totalExpense = 0;
    let pendingIncome = 0;
    let pendingExpense = 0;
    let overdueIncome = 0;
    let overdueExpense = 0;

    const now = new Date();

    for (const e of entries) {
      const amt = toNumber(e.amount);
      const isIncome = e.type === 'INCOME';
      const isPending = e.status === 'PENDING';
      const isOverdue = e.status === 'OVERDUE' || (e.status === 'PENDING' && e.dueDate < now);

      if (isIncome) totalIncome += amt; else totalExpense += amt;
      if (isPending) { if (isIncome) pendingIncome += amt; else pendingExpense += amt; }
      if (isOverdue) { if (isIncome) overdueIncome += amt; else overdueExpense += amt; }
    }

    const netIncome = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      netIncome,
      pendingIncome,
      pendingExpense,
      overdueIncome,
      overdueExpense,
      totalAccounts: 0,
      totalBalance: netIncome,
      totalCreditLimit: 0,
      transactionsThisMonth: entries.filter(e => {
        const d = e.createdAt;
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
      incomeThisMonth: entries.filter(e => e.type === 'INCOME').reduce<number>((s, e) => {
        const d = e.createdAt;
        const now = new Date();
        return s + (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() ? toNumber(e.amount) : 0);
      }, 0),
      expenseThisMonth: entries.filter(e => e.type === 'EXPENSE').reduce<number>((s, e) => {
        const d = e.createdAt;
        const now = new Date();
        return s + (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() ? toNumber(e.amount) : 0);
      }, 0),
      topIncomeCategories: [],
      topExpenseCategories: []
    };
  }

  async getCashFlow(companyId: string, startDate: string, endDate: string): Promise<CashFlowDTO[]> {
    const entries = await this.prisma.financialEntry.findMany({
      where: {
        companyId,
        dueDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    });

    const byDate: Record<string, { income: number; expense: number }> = {};
    const toNumber = (v: any) => (typeof v === 'object' && v !== null && 'toNumber' in v ? v.toNumber() : Number(v));

    for (const e of entries) {
      const key = e.dueDate.toISOString().slice(0, 10);
      if (!byDate[key]) byDate[key] = { income: 0, expense: 0 };
      const amt = toNumber(e.amount);
      if (e.type === 'INCOME') byDate[key].income += amt; else byDate[key].expense += amt;
    }

    let cumulative = 0;
    const flow: CashFlowDTO[] = Object.keys(byDate)
      .sort()
      .map((date) => {
        const { income = 0, expense = 0 } = byDate[date] || {};
        const balance = income - expense;
        cumulative += balance;
        return { date, income, expense, balance, cumulativeBalance: cumulative };
      });

    return flow;
  }

  async findForReport(companyId: string, _filters: Record<string, unknown>): Promise<FinancialReportDTO[]> {
    const entries = await this.prisma.financialEntry.findMany({
      where: { companyId },
      include: {
        user: { select: { name: true } }
      }
    });

    const toNumber = (v: any) => (typeof v === 'object' && v !== null && 'toNumber' in v ? v.toNumber() : Number(v));

    return entries.map((e) => ({
      id: e.id,
      type: e.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
      categoryName: e.category,
      accountName: 'N/A',
      amount: toNumber(e.amount),
      paidAmount: e.paidDate ? toNumber(e.amount) : undefined,
      description: e.description,
      dueDate: e.dueDate.toISOString(),
      ...(e.paidDate ? { paymentDate: e.paidDate.toISOString() } : {}),
      status: e.status,
      paymentMethod: undefined,
      tags: undefined,
      notes: e.notes || undefined,
      referenceType: undefined,
      userName: e.user?.name || ''
    }));
  }
}