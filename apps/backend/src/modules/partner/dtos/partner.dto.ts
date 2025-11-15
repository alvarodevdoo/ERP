import { z } from 'zod';

const PartnerTypeEnum = z.enum(['CUSTOMER', 'SUPPLIER', 'BOTH']);

// Schema de validação para criação de parceiro
export const createPartnerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  email: z.string().email().optional().describe({ example: 'partner@example.com' } as const),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  document: z.string().optional(),
  type: PartnerTypeEnum,
  notes: z.string().optional(),
  
  address: z.object({
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().default('Brasil')
  }).optional(),
  
  creditLimit: z.number().min(0, 'Limite de crédito deve ser positivo').optional(),
  paymentTerms: z.string().optional(),
  
  salesRepresentative: z.string().optional(),
  discount: z.number().min(0, 'Desconto deve ser positivo').max(100, 'Desconto não pode ser maior que 100%').optional(),
  
  metadata: z.record(z.string(), z.unknown()).optional()
});

// Schema de validação para atualização de parceiro
export const updatePartnerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres').optional(),
  email: z.string().email().optional().describe({ example: 'partner@example.com' } as const),
  phone: z.string().min(1, 'Telefone é obrigatório').optional(),
  document: z.string().optional(),
  type: PartnerTypeEnum.optional(),
  notes: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional()
  }).optional(),
  creditLimit: z.number().min(0, 'Limite de crédito deve ser positivo').optional(),
  paymentTerms: z.string().optional(),
  salesRepresentative: z.string().optional(),
  discount: z.number().min(0, 'Desconto deve ser positivo').max(100, 'Desconto não pode ser maior que 100%').optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

// Schema de validação para filtros de busca
export const partnerFiltersSchema = z.object({
  search: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional().describe({ example: 'partner@example.com' } as const),
  document: z.string().optional(),
  type: PartnerTypeEnum.optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  salesRepresentative: z.string().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'email', 'createdAt', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

// Schema de validação para contatos do parceiro
export const createPartnerContactSchema = z.object({
  partnerId: z.string().uuid('ID do parceiro inválido'),
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  email: z.string().email().optional().describe({ example: 'contact@example.com' } as const),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional()
});

export const updatePartnerContactSchema = createPartnerContactSchema.partial().omit({ partnerId: true });

// Schema para resposta de contato do parceiro
export const partnerContactResponseDto = z.object({
  id: z.string(),
  partnerId: z.string(),
  name: z.string(),
  email: z.string().optional().describe({ example: 'contact@example.com' } as const),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  isPrimary: z.boolean(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema para resposta de parceiro
export const partnerResponseDto = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional().describe({ example: 'partner@example.com' } as const),
  phone: z.string().optional(),
  document: z.string().optional(),
  type: PartnerTypeEnum,
  isActive: z.boolean(),
  notes: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  creditLimit: z.number().optional(),
  paymentTerms: z.string().optional(),
  salesRepresentative: z.string().optional(),
  discount: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  contacts: z.array(partnerContactResponseDto).optional(),
  companyId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
});

// Schema para estatísticas de parceiros
export const partnerStatsDto = z.object({
  total: z.number(),
  active: z.number(),
  inactive: z.number(),
  blocked: z.number(),
  customers: z.number(),
  suppliers: z.number(),
  both: z.number(),
  totalCreditLimit: z.number(),
  averageCreditLimit: z.number(),
  topCustomers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    totalOrders: z.number(),
    totalValue: z.number(),
  })),
  topSuppliers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    totalPurchases: z.number(),
    totalValue: z.number(),
  })),
});

// Schema para relatório de parceiros
export const partnerReportDto = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional().describe({ example: 'partner@example.com' } as const),
  phone: z.string().optional(),
  document: z.string().optional(),
  type: z.string(),
  isActive: z.boolean(),
  city: z.string().optional(),
  state: z.string().optional(),
  creditLimit: z.number().optional(),
  totalOrders: z.number().optional(),
  totalValue: z.number().optional(),
  lastOrderDate: z.date().optional(),
  createdAt: z.date(),
});


// Tipos TypeScript derivados dos schemas
export type CreatePartnerDTO = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerDTO = z.infer<typeof updatePartnerSchema>;
export type PartnerFiltersDTO = z.infer<typeof partnerFiltersSchema>;
export type CreatePartnerContactDTO = z.infer<typeof createPartnerContactSchema>;
export type UpdatePartnerContactDTO = z.infer<typeof updatePartnerContactSchema>;
export type PartnerResponseDTO = z.infer<typeof partnerResponseDto>;
export type PartnerContactResponseDTO = z.infer<typeof partnerContactResponseDto>;
export type PartnerStatsDTO = z.infer<typeof partnerStatsDto>;
export type PartnerReportDTO = z.infer<typeof partnerReportDto>;