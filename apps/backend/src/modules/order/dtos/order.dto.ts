import { z } from 'zod';

// Schemas de validação
export const createOrderSchema = z.object({
  quoteId: z.string().uuid().optional(),
  partnerId: z.string().uuid(),
  title: z.string().min(1, 'Título é obrigatório').max(255),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  expectedStartDate: z.string().datetime().optional(),
  expectedEndDate: z.string().datetime().optional(),
  actualStartDate: z.string().datetime().optional(),
  actualEndDate: z.string().datetime().optional(),
  paymentTerms: z.string().optional(),
  observations: z.string().optional(),
  discount: z.number().min(0).default(0),
  discountType: z.enum(['FIXED', 'PERCENTAGE']).default('FIXED'),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive(),
    unitPrice: z.number().min(0),
    discount: z.number().min(0).default(0),
    discountType: z.enum(['FIXED', 'PERCENTAGE']).default('FIXED'),
    observations: z.string().optional()
  })).min(1, 'Pelo menos um item é obrigatório')
});

export const updateOrderSchema = z.object({
  partnerId: z.string().uuid().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  expectedStartDate: z.string().datetime().optional(),
  expectedEndDate: z.string().datetime().optional(),
  actualStartDate: z.string().datetime().optional(),
  actualEndDate: z.string().datetime().optional(),
  paymentTerms: z.string().optional(),
  observations: z.string().optional(),
  discount: z.number().min(0).optional(),
  discountType: z.enum(['FIXED', 'PERCENTAGE']).optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive(),
    unitPrice: z.number().min(0),
    discount: z.number().min(0).default(0),
    discountType: z.enum(['FIXED', 'PERCENTAGE']).default('FIXED'),
    observations: z.string().optional()
  })).optional()
});

export const orderFiltersSchema = z.object({
  search: z.string().optional(),
  partnerId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  expectedStartDate: z.string().datetime().optional(),
  expectedEndDate: z.string().datetime().optional(),
  minValue: z.number().min(0).optional(),
  maxValue: z.number().min(0).optional(),
  assignedTo: z.string().uuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'number', 'title', 'priority', 'expectedStartDate', 'expectedEndDate', 'totalValue']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED']),
  reason: z.string().optional()
});

export const assignOrderSchema = z.object({
  assignedTo: z.string().uuid(),
  notes: z.string().optional()
});

export const addOrderTimeTrackingSchema = z.object({
  employeeId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  description: z.string().optional(),
  billable: z.boolean().default(true)
});

export const updateOrderTimeTrackingSchema = z.object({
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  description: z.string().optional(),
  billable: z.boolean().optional()
});

export const addOrderExpenseSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().positive(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  date: z.string().datetime(),
  receipt: z.string().optional(),
  billable: z.boolean().default(true)
});

export const updateOrderExpenseSchema = z.object({
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
  receipt: z.string().optional(),
  billable: z.boolean().optional()
});

// Tipos TypeScript inferidos dos schemas
export type CreateOrderDTO = z.infer<typeof createOrderSchema>;
export type UpdateOrderDTO = z.infer<typeof updateOrderSchema>;
export type OrderFiltersDTO = z.infer<typeof orderFiltersSchema>;
export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>;
export type AssignOrderDTO = z.infer<typeof assignOrderSchema>;
export type AddOrderTimeTrackingDTO = z.infer<typeof addOrderTimeTrackingSchema>;
export type UpdateOrderTimeTrackingDTO = z.infer<typeof updateOrderTimeTrackingSchema>;
export type AddOrderExpenseDTO = z.infer<typeof addOrderExpenseSchema>;
export type UpdateOrderExpenseDTO = z.infer<typeof updateOrderExpenseSchema>;

// Interfaces de resposta
export const orderItemResponseDto = z.object({
  id: z.string(),
  productId: z.string().optional(),
  productName: z.string(),
  productCode: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  discount: z.number(),
  discountType: z.enum(['FIXED', 'PERCENTAGE']),
  subtotal: z.number(),
  total: z.number(),
  observations: z.string().optional(),
});
export type OrderItemResponseDTO = z.infer<typeof orderItemResponseDto>;

export const orderTimeTrackingResponseDto = z.object({
  id: z.string(),
  employeeId: z.string(),
  employeeName: z.string(),
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number().optional(), // em minutos
  description: z.string().optional(),
  billable: z.boolean(),
  createdAt: z.date(),
});
export type OrderTimeTrackingResponseDTO = z.infer<typeof orderTimeTrackingResponseDto>;

export const orderExpenseResponseDto = z.object({
  id: z.string(),
  description: z.string(),
  amount: z.number(),
  category: z.string().optional(),
  date: z.date(),
  receipt: z.string().optional(),
  billable: z.boolean(),
  createdAt: z.date(),
});
export type OrderExpenseResponseDTO = z.infer<typeof orderExpenseResponseDto>;

export const orderResponseDto = z.object({
  id: z.string(),
  number: z.string(),
  quoteId: z.string().optional(),
  quoteNumber: z.string().optional(),
  partnerId: z.string(),
  partnerName: z.string(),
  partnerDocument: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  expectedStartDate: z.date().optional(),
  expectedEndDate: z.date().optional(),
  actualStartDate: z.date().optional(),
  actualEndDate: z.date().optional(),
  paymentTerms: z.string().optional(),
  observations: z.string().optional(),
  discount: z.number(),
  discountType: z.enum(['FIXED', 'PERCENTAGE']),
  subtotal: z.number(),
  discountValue: z.number(),
  totalValue: z.number(),
  assignedTo: z.string().optional(),
  assignedToName: z.string().optional(),
  items: z.array(orderItemResponseDto),
  timeTracking: z.array(orderTimeTrackingResponseDto),
  expenses: z.array(orderExpenseResponseDto),
  totalHours: z.number(),
  totalExpenses: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  createdByName: z.string(),
});
export type OrderResponseDTO = z.infer<typeof orderResponseDto>;

// Interface para estatísticas
export const orderStatsDto = z.object({
  total: z.number(),
  byStatus: z.object({
    pending: z.number(),
    inProgress: z.number(),
    paused: z.number(),
    completed: z.number(),
    cancelled: z.number(),
  }),
  byPriority: z.object({
    low: z.number(),
    medium: z.number(),
    high: z.number(),
    urgent: z.number(),
  }),
  totalValue: z.number(),
  averageValue: z.number(),
  averageCompletionTime: z.number(), // em dias
  thisMonth: z.object({
    total: z.number(),
    totalValue: z.number(),
    completed: z.number(),
    completedValue: z.number(),
  }),
  lastMonth: z.object({
    total: z.number(),
    totalValue: z.number(),
    completed: z.number(),
    completedValue: z.number(),
  }),
  overdue: z.number(),
  totalHours: z.number(),
  totalExpenses: z.number(),
});
export type OrderStatsDTO = z.infer<typeof orderStatsDto>;

// Interface para relatório
export const orderReportDto = z.object({
  id: z.string(),
  number: z.string(),
  customerName: z.string(),
  customerDocument: z.string(),
  title: z.string(),
  status: z.string(),
  priority: z.string(),
  expectedStartDate: z.string().optional(),
  expectedEndDate: z.string().optional(),
  actualStartDate: z.string().optional(),
  actualEndDate: z.string().optional(),
  subtotal: z.number(),
  discountValue: z.number(),
  totalValue: z.number(),
  totalHours: z.number(),
  totalExpenses: z.number(),
  itemsCount: z.number(),
  assignedToName: z.string().optional(),
  createdAt: z.string(),
  createdByName: z.string(),
});
export type OrderReportDTO = z.infer<typeof orderReportDto>;

// Interface para dashboard
export const orderDashboardDto = z.object({
  stats: orderStatsDto,
  recentOrders: z.array(orderResponseDto),
  overdueOrders: z.array(orderResponseDto),
  upcomingDeadlines: z.array(orderResponseDto),
  topCustomers: z.array(z.object({
    customerId: z.string(),
    customerName: z.string(),
    ordersCount: z.number(),
    totalValue: z.number(),
  })),
  productivityMetrics: z.object({
    averageHoursPerOrder: z.number(),
    averageExpensesPerOrder: z.number(),
    completionRate: z.number(),
    onTimeDeliveryRate: z.number(),
  }),
});
export type OrderDashboardDTO = z.infer<typeof orderDashboardDto>;