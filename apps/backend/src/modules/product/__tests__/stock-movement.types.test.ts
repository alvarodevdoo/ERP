import { describe, it, expect } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { stockMovementResponseDto } from '../../product/dtos';

describe('StockMovementResponseDto schema', () => {
  it('validates a minimal valid movement response', () => {
    const sample = {
      id: uuidv4(),
      productId: uuidv4(),
      product: { id: uuidv4(), name: 'Produto', sku: 'SKU001' },
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
      userId: uuidv4(),
      user: { id: uuidv4(), name: 'Usuário' },
      companyId: uuidv4(),
      createdAt: new Date(),
    };

    const parsed = stockMovementResponseDto.parse(sample);
    expect(parsed).toBeDefined();
    expect(parsed.product.name).toBe('Produto');
  });
});