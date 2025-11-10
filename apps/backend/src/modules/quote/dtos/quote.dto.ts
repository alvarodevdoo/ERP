import { z } from 'zod';

// Schemas de validação
export const createQuoteSchema = z.object({
  customerId: z.string().uuid('ID do cliente deve ser um UUID válido'),
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título deve ter no máximo 200 caracteres'),
  description: z.string().optional(),
  validUntil: z.string().datetime('Data de validade deve ser uma data válida'),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  observations: z.string().optional(),
  discount: z.number().min(0, 'Desconto deve ser maior ou igual a 0').default(0),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
  items: z.array(z.object({
    productId: z.string().uuid('ID do produto deve ser um UUID válido'),
    quantity: z.number().min(0.01, 'Quantidade deve ser maior que 0'),
    unitPrice: z.number().min(0, 'Preço unitário deve ser maior ou igual a 0'),
    discount: z.number().min(0, 'Desconto deve ser maior ou igual a 0').default(0),
    discountType: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
    observations: z.string().optional()
  })).min(1, 'Orçamento deve ter pelo menos um item')
});

export const updateQuoteSchema = z.object({
  customerId: z.string().uuid('ID do cliente deve ser um UUID válido').optional(),
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título deve ter no máximo 200 caracteres').optional(),
  description: z.string().optional(),
  validUntil: z.string().datetime('Data de validade deve ser uma data válida').optional(),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  observations: z.string().optional(),
  discount: z.number().min(0, 'Desconto deve ser maior ou igual a 0').optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  items: z.array(z.object({
    id: z.string().uuid().optional(), // Para atualização de item existente
    productId: z.string().uuid('ID do produto deve ser um UUID válido'),
    quantity: z.number().min(0.01, 'Quantidade deve ser maior que 0'),
    unitPrice: z.number().min(0, 'Preço unitário deve ser maior ou igual a 0'),
    discount: z.number().min(0, 'Desconto deve ser maior ou igual a 0').default(0),
    discountType: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
    observations: z.string().optional()
  })).optional()
});

export const quoteFiltersSchema = z.object({
  search: z.string().optional(),
  customerId: z.string().uuid().optional(),
  status: z.enum(['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minValue: z.number().min(0).optional(),
  maxValue: z.number().min(0).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'validUntil', 'totalValue', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const updateQuoteStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED']),
  reason: z.string().optional()
});

export const duplicateQuoteSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título deve ter no máximo 200 caracteres').optional(),
  customerId: z.string().uuid('ID do cliente deve ser um UUID válido').optional(),
  validUntil: z.string().datetime('Data de validade deve ser uma data válida').optional()
});

// Tipos TypeScript inferidos dos schemas
export type CreateQuoteDTO = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteDTO = z.infer<typeof updateQuoteSchema>;
export type QuoteFiltersDTO = z.infer<typeof quoteFiltersSchema>;
export type UpdateQuoteStatusDTO = z.infer<typeof updateQuoteStatusSchema>;
export type DuplicateQuoteDTO = z.infer<typeof duplicateQuoteSchema>;

// Schemas de resposta
export const quoteItemResponseDto = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  productCode: z.string().optional(),
  quantity: z.number(),
  unitPrice: z.number(),
  discount: z.number(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number(),
  subtotal: z.number(),
  total: z.number(),
  observations: z.string().optional(),
});

export const quoteResponseDto = z.object({
  id: z.string(),
  number: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  customerDocument: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED']),
  validUntil: z.date(),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  observations: z.string().optional(),
  discount: z.number(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  subtotal: z.number(),
  discountValue: z.number(),
  totalValue: z.number(),
  items: z.array(quoteItemResponseDto),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  createdByName: z.string(),
});

// Schema para estatísticas
export const quoteStatsDto = z.object({
  total: z.number(),
  byStatus: z.object({
    draft: z.number(),
    sent: z.number(),
    approved: z.number(),
    rejected: z.number(),
    expired: z.number(),
    converted: z.number(),
  }),
  totalValue: z.number(),
  averageValue: z.number(),
  conversionRate: z.number(),
  thisMonth: z.object({
    total: z.number(),
    totalValue: z.number(),
    approved: z.number(),
    approvedValue: z.number(),
  }),
  lastMonth: z.object({
    total: z.number(),
    totalValue: z.number(),
    approved: z.number(),
    approvedValue: z.number(),
  }),
});

// Schema para relatório
export const quoteReportDto = z.object({
  id: z.string(),
  number: z.string(),
  customerName: z.string(),
  customerDocument: z.string().optional(),
  title: z.string(),
  status: z.string(),
  validUntil: z.string(),
  subtotal: z.number(),
  discountValue: z.number(),
  totalValue: z.number(),
  itemsCount: z.number(),
  createdAt: z.string(),
  createdByName: z.string(),
});

// Schema para conversão em OS
export const convertToOrderDto = z.object({
  orderId: z.string(),
  orderNumber: z.string(),
  message: z.string(),
});



// Schema para conversão em OS
export const convertToOrderSchema = z.object({
  deliveryDate: z.string().datetime('Data de entrega deve ser uma data válida').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  observations: z.string().optional()
});

export type ConvertToOrderRequestDTO = z.infer<typeof convertToOrderSchema>;