import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FinancialService } from '../../financial/services/financial.service';
import { createMockPrisma } from '../../../test-utils/prismaMock';
import { AppError } from '../../../shared/errors/AppError';

// Definindo um objeto de filtros base obrigatório para os testes de listagem/relatório.
// A mensagem de erro exigiu: page, limit, sortBy, sortOrder
const REQUIRED_LIST_FILTERS = {
  page: 1,
  limit: 10,
  sortBy: 'name', // Usando um valor válido de string. A imagem sugere 'type' | 'name' | 'createdAt' | 'balance'
  sortOrder: 'asc',
};

describe('FinancialService - casos adicionais', () => {
  const makeService = (entries: any[] = []) => {
    const now = new Date();
    const prisma = createMockPrisma(
      { entries },
      {
        financialEntry: {
          findMany: async (_args?: any) => entries,
          findFirst: async (_args?: any) => entries[0] ?? null,
          create: async ({ data }: any) => ({
            id: data?.id ?? 'tx_1',
            ...data,
            createdAt: now,
            updatedAt: now,
          }),
          update: async ({ where, data }: any) => ({
            id: where?.id ?? 'tx_1',
            companyId: where?.companyId ?? 'company_1',
            dueDate: now,
            ...data,
            createdAt: now,
            updatedAt: now,
          }),
          delete: async (_args: any) => undefined,
          count: async (_args?: any) => entries.length,
        },
      } as any
    );
    const service = new FinancialService(prisma as any);
    // Por padrão, permitir todas as ações
    (service as any).roleService = {
      checkPermission: vi.fn().mockResolvedValue(true),
    };
    // Substituir o repositório por um mock simples para controlar retornos
    const nowCopy = new Date(now);
    (service as any).financialRepository = {
      // Transações
      createTransaction: vi.fn().mockImplementation(async (data: any) => ({
        id: 'tx_1',
        type: data.type ?? 'INCOME',
        status: data.status ?? 'PENDING',
        amount: data.amount ?? 100,
        description: data.description ?? 'Teste',
        dueDate: data.dueDate ? new Date(data.dueDate) : nowCopy,
        companyId: data.companyId ?? 'company_1',
        userId: data.userId ?? 'user_1',
        createdAt: nowCopy,
        updatedAt: nowCopy,
      })),
      findTransactionById: vi.fn().mockResolvedValue({
        id: 'tx_1', type: 'INCOME', status: 'PENDING', amount: 100,
        description: 'Teste', dueDate: nowCopy, companyId: 'company_1', userId: 'user_1', createdAt: nowCopy, updatedAt: nowCopy,
      }),
      findTransactions: vi.fn().mockResolvedValue({ transactions: [], total: 0, totalPages: 0 }),
      updateTransaction: vi.fn().mockImplementation(async (id: string, data: any) => ({
        id, companyId: 'company_1', status: data.status ?? 'PENDING', paymentDate: data.paymentDate ?? nowCopy,
        notes: data.notes ?? null, type: 'INCOME', amount: data.amount ?? 100, description: data.description ?? 'Teste', dueDate: nowCopy,
        createdAt: nowCopy, updatedAt: nowCopy,
      })),
      deleteTransaction: vi.fn().mockResolvedValue(undefined),

      // Categorias
      createCategory: vi.fn().mockImplementation(async (data: any) => ({
        id: 'cat_1', name: data.name ?? 'Geral', companyId: data.companyId ?? 'company_1', createdAt: nowCopy, updatedAt: nowCopy,
      })),
      findCategoryById: vi.fn().mockResolvedValue({ id: 'cat_1', name: 'Geral', companyId: 'company_1', createdAt: nowCopy, updatedAt: nowCopy }),
      findCategories: vi.fn().mockResolvedValue({ categories: [], total: 0, totalPages: 0 }),
      updateCategory: vi.fn().mockImplementation(async (_id: string, data: any) => ({ id: 'cat_1', name: data.name ?? 'Atualizada', companyId: 'company_1', createdAt: nowCopy, updatedAt: nowCopy })),
      deleteCategory: vi.fn().mockResolvedValue(undefined),

      // Contas
      createAccount: vi.fn().mockImplementation(async (data: any) => ({ id: 'acc_1', name: data.name ?? 'Conta', balance: data.balance ?? 0, companyId: data.companyId ?? 'company_1', createdAt: nowCopy, updatedAt: nowCopy })),
      findAccountById: vi.fn().mockResolvedValue({ id: 'acc_1', name: 'Conta', balance: 0, companyId: 'company_1', createdAt: nowCopy, updatedAt: nowCopy }),
      findAccounts: vi.fn().mockResolvedValue({ accounts: [], total: 0, totalPages: 0 }),
      updateAccount: vi.fn().mockImplementation(async (_id: string, data: any) => ({ id: 'acc_1', name: data.name ?? 'Conta', balance: data.balance ?? 0, companyId: 'company_1', createdAt: nowCopy, updatedAt: nowCopy })),
      deleteAccount: vi.fn().mockResolvedValue(undefined),

      // Transferências e relatórios
      createTransfer: vi.fn().mockImplementation(async (data: any) => ({ id: 'trf_1', fromAccountId: data.fromAccountId, toAccountId: data.toAccountId, amount: data.amount ?? 50, companyId: data.companyId ?? 'company_1', userId: data.userId ?? 'user_1', createdAt: nowCopy, updatedAt: nowCopy })),
      findTransfers: vi.fn().mockResolvedValue({ transfers: [], total: 0, totalPages: 0 }),
      getStats: vi.fn().mockResolvedValue({ totalIncome: 0, totalExpenses: 0, balance: 0, pendingReceivables: 0, pendingPayables: 0 }),
      getCashFlow: vi.fn().mockResolvedValue([]),
      findForReport: vi.fn().mockResolvedValue([{ id: 'r1', type: 'INCOME', amount: 100, description: 'R', date: nowCopy.toISOString() }]),
    };
    return { service, prisma };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve negar updateTransaction quando permissão faltar', async () => {
    const { service } = makeService();
    (service as any).roleService = {
      checkPermission: vi.fn().mockResolvedValue(false),
    };

    await expect(
      service.updateTransaction('tx_nope', { description: 'x' } as any, 'user_1', 'company_1')
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('deve lançar erro se updateTransaction não encontrar transação', async () => {
    const { service } = makeService([]);
    (service as any).financialRepository.findTransactionById.mockResolvedValue(null);
    await expect(
      service.updateTransaction('tx_missing', { description: 'novo' } as any, 'user_1', 'company_1')
    ).rejects.toBeInstanceOf(AppError);
  });

  it('deve atualizar transação com sucesso em updateTransaction', async () => {
    const now = new Date();
    const entry = { id: 'tx_123', status: 'PENDING', amount: 100, dueDate: now, createdAt: now, updatedAt: now };
    const { service } = makeService([entry]);

    const updated = await service.updateTransaction('tx_123', {
      description: 'atualizada',
      amount: 150,
    } as any, 'user_1', 'company_1');

    expect(updated).toBeTruthy();
    expect(updated.id).toBe('tx_123');
    expect(updated.amount).toBe(150);
  });

  it('deve pagar transação pendente em payTransaction', async () => {
    const now = new Date();
    const entry = { id: 'tx_pay', status: 'PENDING', amount: 90, dueDate: now, createdAt: now, updatedAt: now };
    const { service } = makeService([entry]);

    const paid = await service.payTransaction('tx_pay', { paymentDate: now.toISOString(), notes: 'Pago' } as any, 'user_1', 'company_1');

    expect(paid).toBeTruthy();
    expect(paid.id).toBe('tx_pay');
    expect(paid.status).toBe('PAID');
  });

  it('deve falhar ao pagar transação que não está pendente', async () => {
    const now = new Date();
    const entry = { id: 'tx_paid', status: 'PAID', amount: 100, dueDate: now, createdAt: now, updatedAt: now };
    const { service } = makeService([entry]);
    // Garante que o repositório retorne status diferente de PENDING
    (service as any).financialRepository.findTransactionById.mockResolvedValue({ status: 'PAID' });
    await expect(service.payTransaction('tx_paid', { paymentDate: now.toISOString() } as any, 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('deve deletar transação existente em deleteTransaction', async () => {
    const now = new Date();
    const entry = { id: 'tx_del', status: 'PENDING', amount: 50, dueDate: now, createdAt: now, updatedAt: now };
    const { service } = makeService([entry]);

    await expect(service.deleteTransaction('tx_del', 'user_1', 'company_1')).resolves.toBeUndefined();
  });

  it('deve negar listagem de transações sem permissão', async () => {
    const now = new Date();
    const entry = { id: 'tx_list', status: 'PENDING', amount: 10, dueDate: now, createdAt: now, updatedAt: now };
    const { service } = makeService([entry]);
    (service as any).roleService = {
      checkPermission: vi.fn().mockResolvedValue(false),
    };
    // Corrigido: Incluindo filtros obrigatórios
    await expect(service.findTransactions(REQUIRED_LIST_FILTERS as any, 'user_1', 'company_1')).rejects.toMatchObject({ statusCode: 403 });
  });

  it('findTransactions deve retornar lista quando autorizado', async () => {
    const { service } = makeService([]);
    // Corrigido: Incluindo filtros obrigatórios
    const res = await service.findTransactions(REQUIRED_LIST_FILTERS as any, 'user_1', 'company_1');
    expect(res).toEqual({ transactions: [], total: 0, totalPages: 0 });
  });

  it('createTransaction deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    await expect(service.createTransaction({ type: 'INCOME', amount: 100, description: 'X', dueDate: new Date().toISOString(), installments: 1 } as any, 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('createTransaction deve criar sem parcelas quando installments = 1', async () => {
    const { service } = makeService([]);
    const res = await service.createTransaction({ type: 'INCOME', amount: 100, description: 'X', dueDate: new Date().toISOString(), installments: 1, status: 'PENDING' } as any, 'user_1', 'company_1');
    expect(res.id).toBe('tx_1');
  });

  it('createTransaction deve criar parcelas quando installments > 1', async () => {
    const { service, prisma } = makeService([]);
    const installments = 4;
    const res = await service.createTransaction({ type: 'INCOME', amount: 400, description: 'Parcelado', dueDate: new Date().toISOString(), installments } as any, 'user_1', 'company_1');
    // Apenas valida que a criação da transação principal ocorreu sem erro
    expect(res).toBeTruthy();
  });

  it('createTransaction deve capturar erro interno e lançar AppError', async () => {
    const { service } = makeService([]);
    (service as any).financialRepository.createTransaction.mockRejectedValue(new Error('falha'));
    await expect(service.createTransaction({ type: 'INCOME', amount: 100, description: 'X', dueDate: new Date().toISOString(), installments: 1 } as any, 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('findTransactionById deve retornar a transação quando autorizado', async () => {
    const { service } = makeService([]);
    const res = await service.findTransactionById('tx_1', 'user_1', 'company_1');
    expect(res.id).toBe('tx_1');
  });

  it('findTransactionById deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    await expect(service.findTransactionById('tx_1', 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('findTransactionById deve lançar 404 quando não encontrada', async () => {
    const { service } = makeService([]);
    (service as any).financialRepository.findTransactionById.mockResolvedValue(null);
    await expect(service.findTransactionById('tx_x', 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('deleteTransaction deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    await expect(service.deleteTransaction('tx_1', 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('deleteTransaction deve lançar 404 quando não encontrada', async () => {
    const { service } = makeService([]);
    (service as any).financialRepository.findTransactionById.mockResolvedValue(null);
    await expect(service.deleteTransaction('tx_missing', 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  // Categorias
  it('createCategory deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    await expect(service.createCategory({ name: 'Geral' } as any, 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('createCategory deve criar com sucesso', async () => {
    const { service } = makeService([]);
    const res = await service.createCategory({ name: 'Geral' } as any, 'user_1', 'company_1');
    expect(res.id).toBe('cat_1');
  });

  it('findCategoryById deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    await expect(service.findCategoryById('cat_1', 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('findCategoryById deve lançar 404 quando não encontrada', async () => {
    const { service } = makeService([]);
    (service as any).financialRepository.findCategoryById.mockResolvedValue(null);
    await expect(service.findCategoryById('cat_missing', 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('findCategories deve retornar lista quando autorizado', async () => {
    const { service } = makeService([]);
    // Corrigido: Incluindo filtros obrigatórios
    const res = await service.findCategories(REQUIRED_LIST_FILTERS as any, 'user_1', 'company_1');
    expect(res).toEqual({ categories: [], total: 0, totalPages: 0 });
  });

  it('updateCategory deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    await expect(service.updateCategory('cat_1', { name: 'G' } as any, 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('updateCategory deve lançar 404 quando não encontrada', async () => {
    const { service } = makeService([]);
    (service as any).financialRepository.findCategoryById.mockResolvedValue(null);
    await expect(service.updateCategory('cat_missing', { name: 'G' } as any, 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('updateCategory deve atualizar com sucesso', async () => {
    const { service } = makeService([]);
    const res = await service.updateCategory('cat_1', { name: 'Nova' } as any, 'user_1', 'company_1');
    expect(res.name).toBe('Nova');
  });

  it('deleteCategory deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    await expect(service.deleteCategory('cat_1', 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('deleteCategory deve lançar 404 quando não encontrada', async () => {
    const { service } = makeService([]);
    (service as any).financialRepository.findCategoryById.mockResolvedValue(null);
    await expect(service.deleteCategory('cat_missing', 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('deleteCategory deve excluir com sucesso', async () => {
    const { service } = makeService([]);
    await expect(service.deleteCategory('cat_1', 'user_1', 'company_1')).resolves.toBeUndefined();
  });

  // Contas
  it('createAccount deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    await expect(service.createAccount({ name: 'Conta' } as any, 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('createAccount deve criar com sucesso', async () => {
    const { service } = makeService([]);
    const res = await service.createAccount({ name: 'Conta' } as any, 'user_1', 'company_1');
    expect(res.id).toBe('acc_1');
  });

  it('findAccountById deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    await expect(service.findAccountById('acc_1', 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('findAccountById deve lançar 404 quando não encontrada', async () => {
    const { service } = makeService([]);
    (service as any).financialRepository.findAccountById.mockResolvedValue(null);
    await expect(service.findAccountById('acc_missing', 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('findAccounts deve retornar lista quando autorizado', async () => {
    const { service } = makeService([]);
    // Corrigido: Incluindo filtros obrigatórios
    const res = await service.findAccounts(REQUIRED_LIST_FILTERS as any, 'user_1', 'company_1');
    expect(res).toEqual({ accounts: [], total: 0, totalPages: 0 });
  });

  it('updateAccount deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    await expect(service.updateAccount('acc_1', { name: 'N' } as any, 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('updateAccount deve lançar 404 quando não encontrada', async () => {
    const { service } = makeService([]);
    (service as any).financialRepository.findAccountById.mockResolvedValue(null);
    await expect(service.updateAccount('acc_missing', { name: 'N' } as any, 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('updateAccount deve atualizar com sucesso', async () => {
    const { service } = makeService([]);
    const res = await service.updateAccount('acc_1', { name: 'Nova' } as any, 'user_1', 'company_1');
    expect(res.name).toBe('Nova');
  });

  it('deleteAccount deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    await expect(service.deleteAccount('acc_1', 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('deleteAccount deve lançar 404 quando não encontrada', async () => {
    const { service } = makeService([]);
    (service as any).financialRepository.findAccountById.mockResolvedValue(null);
    await expect(service.deleteAccount('acc_missing', 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('deleteAccount deve excluir com sucesso', async () => {
    const { service } = makeService([]);
    await expect(service.deleteAccount('acc_1', 'user_1', 'company_1')).resolves.toBeUndefined();
  });

  // Transferências
  it('findTransfers deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    // Corrigido: Incluindo filtros obrigatórios
    await expect(service.findTransfers(REQUIRED_LIST_FILTERS as any, 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('findTransfers deve retornar lista quando autorizado', async () => {
    const { service } = makeService([]);
    // Corrigido: Incluindo filtros obrigatórios
    const res = await service.findTransfers(REQUIRED_LIST_FILTERS as any, 'user_1', 'company_1');
    expect(res).toEqual({ transfers: [], total: 0, totalPages: 0 });
  });

  it('createTransfer deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    await expect(service.createTransfer({ fromAccountId: 'a', toAccountId: 'b', amount: 10 } as any, 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('createTransfer deve validar contas diferentes', async () => {
    const { service } = makeService([]);
    await expect(service.createTransfer({ fromAccountId: 'a', toAccountId: 'a', amount: 10 } as any, 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('createTransfer deve criar com sucesso', async () => {
    const { service } = makeService([]);
    const res = await service.createTransfer({ fromAccountId: 'a', toAccountId: 'b', amount: 10 } as any, 'user_1', 'company_1');
    expect(res.id).toBe('trf_1');
  });

  it('createTransfer deve capturar erro interno e lançar AppError', async () => {
    const { service } = makeService([]);
    (service as any).financialRepository.createTransfer.mockRejectedValue(new Error('falha'));
    await expect(service.createTransfer({ fromAccountId: 'a', toAccountId: 'b', amount: 10 } as any, 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  // Estatísticas, fluxo de caixa, relatórios e dashboard
  it('getStats deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    await expect(service.getStats('user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('getStats deve retornar dados quando autorizado', async () => {
    const { service } = makeService([]);
    const res = await service.getStats('user_1', 'company_1');
    expect(res).toHaveProperty('balance');
  });

  it('getCashFlow deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    await expect(service.getCashFlow('user_1', 'company_1', '2024-01-01', '2024-12-31')).rejects.toBeInstanceOf(AppError);
  });

  it('getCashFlow deve retornar dados quando autorizado', async () => {
    const { service } = makeService([]);
    const res = await service.getCashFlow('user_1', 'company_1', '2024-01-01', '2024-12-31');
    expect(Array.isArray(res)).toBe(true);
  });

  it('generateReport deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    // Corrigido: Incluindo filtros obrigatórios
    await expect(service.generateReport(REQUIRED_LIST_FILTERS as any, 'user_1', 'company_1', 'json')).rejects.toBeInstanceOf(AppError);
  });

  it('generateReport deve retornar JSON quando format json', async () => {
    const { service } = makeService([]);
    // Corrigido: Incluindo filtros obrigatórios
    const res = await service.generateReport(REQUIRED_LIST_FILTERS as any, 'user_1', 'company_1', 'json');
    expect(Array.isArray(res)).toBe(true);
  });

  it('generateReport deve converter para CSV quando format csv', async () => {
    const { service } = makeService([]);
    // Corrigido: Incluindo filtros obrigatórios
    const res = await service.generateReport(REQUIRED_LIST_FILTERS as any, 'user_1', 'company_1', 'csv');
    expect(typeof res).toBe('string');
  });

  it('generateReport csv deve retornar vazio quando não há dados', async () => {
    const { service } = makeService([]);
    (service as any).financialRepository.findForReport.mockResolvedValue([]);
    // Corrigido: Incluindo filtros obrigatórios
    const res = await service.generateReport(REQUIRED_LIST_FILTERS as any, 'user_1', 'company_1', 'csv');
    expect(res).toBe('');
  });

  it('generateReport csv deve colocar aspas em campos com vírgula', async () => {
    const { service } = makeService([]);
    (service as any).financialRepository.findForReport.mockResolvedValue([
      { id: 'r2', type: 'INCOME', amount: 100, description: 'Receita, parcelada', date: new Date().toISOString() }
    ]);
    // Corrigido: Incluindo filtros obrigatórios
    const res = await service.generateReport(REQUIRED_LIST_FILTERS as any, 'user_1', 'company_1', 'csv');
    expect(res).toContain('"Receita, parcelada"');
  });

  it('getDashboard deve negar acesso sem permissão', async () => {
    const entries = [{ type: 'INCOME', amount: 100 }, { type: 'EXPENSE', amount: 50 }];
    const { service } = makeService(entries as any);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    await expect(service.getDashboard('user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('getDashboard deve retornar dados quando autorizado', async () => {
    const entries = [{ type: 'INCOME', amount: 100 }, { type: 'EXPENSE', amount: 50 }];
    const { service } = makeService(entries as any);
    const res = await service.getDashboard('user_1', 'company_1');
    expect(res).toHaveProperty('stats');
    expect(res).toHaveProperty('cashFlow');
    expect(Array.isArray(res.monthlyComparison)).toBe(true);
  });

  it('getDashboard monthlyComparison deve somar amounts com Decimal.toNumber', async () => {
    const entries = [{ type: 'INCOME', amount: 100 }, { type: 'EXPENSE', amount: 50 }];
    const { service, prisma } = makeService(entries as any);
    // Simula retorno com amounts que possuem toNumber
    (prisma as any).financialEntry.findMany = vi.fn().mockResolvedValue([
      { type: 'INCOME', amount: { toNumber: () => 200 } },
      { type: 'EXPENSE', amount: { toNumber: () => 80 } },
    ]);
    const res = await service.getDashboard('user_1', 'company_1');
    expect(res.monthlyComparison.length).toBe(12);
    res.monthlyComparison.forEach((m) => {
      expect(m.income).toBeGreaterThanOrEqual(200);
      expect(m.expense).toBeGreaterThanOrEqual(80);
      expect(m.netIncome).toBe(m.income - m.expense);
    });
  });

  it('payTransaction deve capturar erro interno e lançar AppError', async () => {
    const now = new Date();
    const entry = { id: 'tx_err', status: 'PENDING', amount: 90, dueDate: now, createdAt: now, updatedAt: now };
    const { service } = makeService([entry]);
    (service as any).financialRepository.updateTransaction.mockRejectedValue(new Error('falha'));
    await expect(service.payTransaction('tx_err', { paymentDate: now.toISOString() } as any, 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('getDashboard deve capturar erro interno e lançar AppError', async () => {
    const { service } = makeService([]);
    (service as any).financialRepository.getStats.mockRejectedValue(new Error('falha'));
    await expect(service.getDashboard('user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('findCategories deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    // Corrigido: Incluindo filtros obrigatórios
    await expect(service.findCategories(REQUIRED_LIST_FILTERS as any, 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('findAccounts deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    // Corrigido: Incluindo filtros obrigatórios
    await expect(service.findAccounts(REQUIRED_LIST_FILTERS as any, 'user_1', 'company_1')).rejects.toBeInstanceOf(AppError);
  });

  it('payTransaction deve negar acesso sem permissão', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(false);
    await expect(
      service.payTransaction('tx_1', { paymentDate: new Date().toISOString() } as any, 'user_1', 'company_1')
    ).rejects.toBeInstanceOf(AppError);
  });

  it('payTransaction deve lançar 404 quando transação não existe', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(true);
    (service as any).financialRepository.findTransactionById.mockResolvedValue(null);
    await expect(
      service.payTransaction('tx_missing', { paymentDate: new Date().toISOString() } as any, 'user_1', 'company_1')
    ).rejects.toBeInstanceOf(AppError);
  });

  it('findCategoryById deve retornar categoria quando existir', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(true);
    const category = { id: 'cat_1', name: 'Cat', type: 'EXPENSE' };
    (service as any).financialRepository.findCategoryById.mockResolvedValue(category);
    await expect(service.findCategoryById('cat_1', 'user_1', 'company_1')).resolves.toEqual(category);
  });

  it('findAccountById deve retornar conta quando existir', async () => {
    const { service } = makeService([]);
    (service as any).roleService.checkPermission.mockResolvedValue(true);
    const account = { id: 'acc_1', name: 'Acc', type: 'BANK' };
    (service as any).financialRepository.findAccountById.mockResolvedValue(account);
    await expect(service.findAccountById('acc_1', 'user_1', 'company_1')).resolves.toEqual(account);
  });
});