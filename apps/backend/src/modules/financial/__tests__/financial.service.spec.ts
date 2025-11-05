import { describe, it, expect, vi } from 'vitest';
import { FinancialService } from '../../financial/services/financial.service';
import { createMockPrisma } from '../../../test-utils/prismaMock';
// Não usar fábrica externa para evitar erro de import antes da inicialização

// usar prisma mock compartilhado

// Monkey-patch RoleService inline para evitar hoisting issues
vi.mock('../../role/services', () => ({
  RoleService: class {
    constructor(_prisma: any) {}
    async checkPermission() {
      return true;
    }
  }
}));

describe('FinancialService basic flow', () => {
  it('createTransaction should create and optionally create installments', async () => {
    const prisma = createMockPrisma();
    const service = new FinancialService(prisma as any);

    const tx = await service.createTransaction({
      type: 'INCOME',
      amount: 100,
      description: 'Teste',
      dueDate: new Date().toISOString(),
      installments: 2,
      status: 'PENDING',
    } as any, 'user_1', 'company_1');

    expect(tx.id).toBeDefined();
    expect(tx.type).toBe('INCOME');
    expect(tx.amount).toBe(100);
  });
});