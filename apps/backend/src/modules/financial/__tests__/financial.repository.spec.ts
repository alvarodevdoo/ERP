import { describe, it, expect } from 'vitest';
import { FinancialRepository } from '../../financial/repositories/financial.repository';
import { createMockPrisma } from '../../../test-utils/prismaMock';

// Usa utilitário compartilhado para mock de Prisma

describe('FinancialRepository stats and cash flow', () => {
  it('getStats should aggregate income and expense correctly', async () => {
    const now = new Date();
    const entries = [
      { type: 'INCOME', status: 'PAID', amount: 100, dueDate: now, createdAt: now },
      { type: 'EXPENSE', status: 'PAID', amount: 40, dueDate: now, createdAt: now },
      { type: 'INCOME', status: 'PENDING', amount: 60, dueDate: new Date(now.getTime() + 86400000), createdAt: now },
      { type: 'EXPENSE', status: 'PENDING', amount: 20, dueDate: new Date(now.getTime() + 86400000), createdAt: now },
    ];
    const prisma = createMockPrisma({ entries });
    const repo = new FinancialRepository(prisma);

    const stats = await repo.getStats('company_1');
    expect(stats.totalIncome).toBe(160);
    expect(stats.totalExpense).toBe(60);
    expect(stats.netIncome).toBe(100);
    expect(stats.pendingIncome).toBe(60);
    expect(stats.pendingExpense).toBe(20);
    expect(stats.transactionsThisMonth).toBe(entries.length);
    expect(typeof stats.incomeThisMonth).toBe('number');
    expect(typeof stats.expenseThisMonth).toBe('number');
  });

  it('getCashFlow should compute daily balances and cumulative', async () => {
    const date1 = new Date('2024-01-10');
    const date2 = new Date('2024-01-11');
    const entries = [
      { type: 'INCOME', status: 'PAID', amount: 200, dueDate: date1, createdAt: date1 },
      { type: 'EXPENSE', status: 'PAID', amount: 50, dueDate: date1, createdAt: date1 },
      { type: 'EXPENSE', status: 'PAID', amount: 100, dueDate: date2, createdAt: date2 },
    ];
    const prisma = createMockPrisma({ entries });
    const repo = new FinancialRepository(prisma);

    const flow = await repo.getCashFlow('company_1', '2024-01-01', '2024-01-31');
    expect(flow.length).toBe(2);
    expect(flow[0].income).toBe(200);
    expect(flow[0].expense).toBe(50);
    expect(flow[0].balance).toBe(150);
    expect(flow[0].cumulativeBalance).toBe(150);
    expect(flow[1].income).toBe(0);
    expect(flow[1].expense).toBe(100);
    expect(flow[1].balance).toBe(-100);
    expect(flow[1].cumulativeBalance).toBe(50);
  });

  it('findForReport should map entries to report fields', async () => {
    const now = new Date();
    const entries = [
      {
        id: 'e1', type: 'INCOME', status: 'PAID', amount: 300,
        dueDate: now, paidDate: now, createdAt: now, description: 'Venda',
        companyId: 'company_1', userId: 'user_1', partnerId: 'partner_1', orderId: 'order_1',
        company: { id: 'company_1', businessName: 'Artplim', fantasyName: 'Artplim' },
        partner: { id: 'partner_1', businessName: 'Fornecedor', fantasyName: 'Fornecedor' },
        order: { id: 'order_1' },
        user: { id: 'user_1', name: 'Usuário', email: 'u@x.com' },
      },
    ];
    const prisma = createMockPrisma({ entries });
    const repo = new FinancialRepository(prisma);
    const report = await repo.findForReport('company_1', {});
    expect(report[0].id).toBe('e1');
    expect(report[0].type).toBe('INCOME');
    expect(report[0].amount).toBe(300);
    expect(report[0].description).toContain('Venda');
    expect(report[0].userName).toBe('Usuário');
  });
});