import { describe, it, expect } from 'vitest';
import { stockMovementResponseDto } from '../../product/dtos';

describe('StockMovementResponseDto schema', () => {
  it('validates a minimal valid movement response', () => {
    const sample = {
      id: '00000000-0000-0000-0000-000000000000',
      productId: '00000000-0000-0000-0000-000000000001',
      product: { id: '00000000-0000-0000-0000-000000000001', name: 'Produto', sku: 'SKU001' },
      variationId: null,
      type: 'IN',
      quantity: 1,
      unitCost: null,
      totalCost: null,
      reason: 'Entrada de estoque',
      reference: null,
      notes: null,
      previousStock: 0,
      newStock: 1,
      userId: '00000000-0000-0000-0000-000000000002',
      user: { id: '00000000-0000-0000-0000-000000000002', name: 'Usuário' },
      companyId: '00000000-0000-0000-0000-000000000003',
      createdAt: new Date(),
    };

    const parsed = stockMovementResponseDto.parse(sample);
    expect(parsed).toBeDefined();
    expect(parsed.product.name).toBe('Produto');
  });
});