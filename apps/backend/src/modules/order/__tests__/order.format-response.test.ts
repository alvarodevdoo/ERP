import { describe, it, expect } from 'vitest';
import { Prisma } from '@prisma/client';
import { OrderRepository } from '../repositories/order.repository';

// Utilitário para construir Decimals
const D = (n: number) => new Prisma.Decimal(n);

describe('OrderRepository.formatOrderResponse', () => {
  it('should conditionally include optional fields to satisfy exactOptionalPropertyTypes', () => {
    const repo = new OrderRepository({} as any);

    const mockOrder: any = {
      id: 'order-1',
      number: '000001',
      quoteId: null,
      quote: null,
      partnerId: 'partner-1',
      partner: { name: 'Cliente', document: '123' },
      title: 'Teste',
      description: null,
      status: 'CONFIRMED',
      priority: 'MEDIUM',
      expectedStartDate: null,
      expectedEndDate: null,
      actualStartDate: null,
      actualEndDate: null,
      paymentTerms: null,
      notes: null,
      discount: D(10),
      discountType: 'PERCENTAGE',
      totalValue: D(100),
      items: [{
        id: 'item-1',
        productId: null,
        product: { name: 'Produto', sku: 'SKU' },
        quantity: D(2),
        unitPrice: D(50),
        discount: D(0),
        discountType: 'PERCENTAGE',
        total: D(100),
        description: null,
      }],
      timeTracking: [{
        id: 'tt-1',
        employeeId: 'emp-1',
        employee: { user: { name: 'Func' } },
        startTime: new Date(),
        endTime: null,
        duration: undefined,
        description: null,
        billable: true,
        createdAt: new Date(),
      }],
      expenses: [{
        id: 'exp-1',
        description: 'Despesa',
        amount: D(10),
        category: undefined,
        date: new Date(),
        receipt: undefined,
        billable: true,
        createdAt: new Date(),
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-1',
      user: { name: 'User' },
    };

    const dto = repo.formatOrderResponse(mockOrder);

    // productId não deve existir quando null
    expect('productId' in dto.items[0]).toBe(false);
    // duration não deve existir quando undefined
    expect('duration' in dto.timeTracking[0]).toBe(false);
    // category e receipt não devem existir quando undefined
    expect('category' in dto.expenses[0]).toBe(false);
    expect('receipt' in dto.expenses[0]).toBe(false);
    // status deve ser mapeado para DTO
    expect(dto.status).toBe('IN_PROGRESS');
  });
});