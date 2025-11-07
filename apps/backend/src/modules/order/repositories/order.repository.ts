import { Prisma, PrismaClient, $Enums } from '@prisma/client';

// Status mapping function to convert Prisma enum to DTO expected values
function mapOrderStatus(status: $Enums.OrderStatus): 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' {
  const statusMap: Record<$Enums.OrderStatus, 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'> = {
    'PENDING': 'PENDING',
    'CONFIRMED': 'IN_PROGRESS',
    'IN_PRODUCTION': 'IN_PROGRESS',
    'READY': 'COMPLETED',
    'DELIVERED': 'COMPLETED',
    'CANCELLED': 'CANCELLED'
  };
  return statusMap[status];
}

// Reverse mapping function to convert DTO status to Prisma enum values
function mapDTOStatusToPrisma(status: 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'): $Enums.OrderStatus[] {
  const reverseStatusMap: Record<'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED', $Enums.OrderStatus[]> = {
    PENDING: ['PENDING'],
    IN_PROGRESS: ['CONFIRMED', 'IN_PRODUCTION'],
    PAUSED: [], // No direct mapping, could be handled as a special case
    COMPLETED: ['READY', 'DELIVERED'],
    CANCELLED: ['CANCELLED']
  };
  return reverseStatusMap[status];
}

const orderWithIncludes = {
  include: {
    partner: {
      select: {
        name: true,
        document: true,
      },
    },
    quote: {
      select: {
        number: true,
      },
    },
    items: {
      include: {
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
      },
    },
    user: {
      select: {
        name: true,
      },
    },
    timeTracking: {
      include: {
        employee: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    },
    expenses: true,
  },
};

type PrismaOrder = Prisma.OrderGetPayload<typeof orderWithIncludes>;
import { 
  CreateOrderDTO, 
  UpdateOrderDTO, 
  OrderFiltersDTO, 
  UpdateOrderStatusDTO,
  // AssignOrderDTO,
  OrderResponseDTO,
  OrderStatsDTO,
  OrderReportDTO
} from '../dtos';
import { AppError } from '../../../shared/errors/AppError';

export class OrderRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Cria uma nova ordem de serviço
   */
  async create(data: CreateOrderDTO, companyId: string, userId: string): Promise<OrderResponseDTO> {
    try {
      // Gerar número sequencial da ordem
      const lastOrder = await this.prisma.order.findFirst({
        where: { companyId },
        orderBy: { number: 'desc' }
      });

      const nextNumber = lastOrder 
        ? String(parseInt(lastOrder.number) + 1).padStart(6, '0')
        : '000001';

      // Calcular valores dos itens
      const itemsWithCalculations = data.items.map(item => {
        const subtotal = item.quantity * item.unitPrice;
        const discountValue = item.discountType === 'PERCENTAGE' 
          ? (subtotal * item.discount) / 100 
          : item.discount;
        const total = subtotal - discountValue;

        return {
          ...item,
          subtotal,
          discountValue,
          total
        };
      });

      // Calcular totais da ordem
      const subtotal = itemsWithCalculations.reduce((sum, item) => sum + item.subtotal, 0);
      const itemsDiscountValue = itemsWithCalculations.reduce((sum, item) => sum + item.discountValue, 0);
      
      const orderDiscountValue = data.discountType === 'PERCENTAGE'
        ? (subtotal * data.discount) / 100
        : data.discount;
      
      const totalValue = subtotal - itemsDiscountValue - orderDiscountValue;

      const order = await this.prisma.order.create({
        data: {
          number: nextNumber,
          company: { connect: { id: companyId } },
          ...(data.quoteId ? { quote: { connect: { id: data.quoteId } } } : {}),
          partner: { connect: { id: data.partnerId } },
          title: data.title,
          description: data.description ?? null,
          status: 'PENDING',
          priority: data.priority,
          expectedStartDate: data.expectedStartDate ? new Date(data.expectedStartDate) : null,
          expectedEndDate: data.expectedEndDate ? new Date(data.expectedEndDate) : null,
          actualStartDate: data.actualStartDate ? new Date(data.actualStartDate) : null,
          actualEndDate: data.actualEndDate ? new Date(data.actualEndDate) : null,
          paymentTerms: data.paymentTerms ?? null,
          notes: data.observations ?? null, // Mapeado
          subtotal: subtotal,
          discount: data.discount,
          discountType: data.discountType,
          totalValue: totalValue,
          user: { connect: { id: userId } },
          items: {
            create: itemsWithCalculations.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              discountType: item.discountType,
              total: item.total,
              description: item.observations ?? '', // Mapeado (string obrigatória)
              company: { connect: { id: companyId } },
            }))
          }
        },
        include: orderWithIncludes.include
      });

      return this.formatOrderResponse(order);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar ordem de serviço', 500);
    }
  }

  /**
   * Busca uma ordem por ID
   */
  async findById(id: string, companyId: string): Promise<OrderResponseDTO | null> {
    try {
      const order = await this.prisma.order.findFirst({
        where: {
          id,
          companyId,
          deletedAt: null
        },
        include: orderWithIncludes.include
      });

      return order ? this.formatOrderResponse(order) : null;
    } catch {
      throw new AppError('Erro ao buscar ordem de serviço', 500);
    }
  }

  /**
   * Lista ordens com filtros e paginação
   */
  async findMany(filters: OrderFiltersDTO, companyId: string): Promise<{
    orders: OrderResponseDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const where: Prisma.OrderWhereInput = {
        companyId,
        deletedAt: null
      };

      // Aplicar filtros
      if (filters.search) {
        where.OR = [
          { number: { contains: filters.search, mode: 'insensitive' } },
          { title: { contains: filters.search, mode: 'insensitive' } },
          { partner: { name: { contains: filters.search, mode: 'insensitive' } } } // Corrigido de customer para partner
        ];
      }

      if (filters.partnerId) {
        where.partnerId = filters.partnerId; // Corrigido de customerId para partnerId
      }

      if (filters.status) {
        const prismaStatuses = mapDTOStatusToPrisma(filters.status);
        if (prismaStatuses.length > 0) {
          where.status = { in: prismaStatuses };
        }
      }

      if (filters.priority) {
        where.priority = filters.priority;
      }

      // Campo assignedTo não existe no schema atual
      // if (filters.assignedTo) {
      //   where.assignedTo = filters.assignedTo;
      // }

      if (filters.startDate || filters.endDate) {
        where.createdAt = {
          ...(filters.startDate && { gte: new Date(filters.startDate) }),
          ...(filters.endDate && { lte: new Date(filters.endDate) }),
        };
      }

      if (filters.expectedStartDate || filters.expectedEndDate) {
        where.expectedStartDate = {
          ...(filters.expectedStartDate && { gte: new Date(filters.expectedStartDate) }),
          ...(filters.expectedEndDate && { lte: new Date(filters.expectedEndDate) }),
        };
      }

      if (filters.minValue !== undefined || filters.maxValue !== undefined) {
        where.totalValue = {
          ...(filters.minValue !== undefined && { gte: filters.minValue }),
          ...(filters.maxValue !== undefined && { lte: filters.maxValue }),
        };
      }

      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          include: orderWithIncludes.include,
          orderBy: {
            [filters.sortBy]: filters.sortOrder
          },
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit
        }),
        this.prisma.order.count({ where })
      ]);

      return {
        orders: orders.map(order => this.formatOrderResponse(order)),
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit)
      };
    } catch {
      throw new AppError('Erro ao listar ordens de serviço', 500);
    }
  }

  /**
   * Atualiza uma ordem
   */
  async update(id: string, data: UpdateOrderDTO, companyId: string): Promise<OrderResponseDTO> {
    try {
      // Verificar se a ordem existe
      const existingOrder = await this.prisma.order.findFirst({
        where: {
          id,
          companyId,
          deletedAt: null
        },
        include: {
          items: true,
        },
      });

      if (!existingOrder) {
        throw new AppError('Ordem de serviço não encontrada', 404);
      }

      // Verificar se pode ser editada
      if (existingOrder.status === 'DELIVERED' || existingOrder.status === 'CANCELLED') {
        throw new AppError('Não é possível editar uma ordem finalizada ou cancelada', 400);
      }

      let updateData: Prisma.OrderUpdateInput = {
        ...(data.partnerId ? { partner: { connect: { id: data.partnerId } } } : {}),
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
        ...(data.expectedStartDate ? { expectedStartDate: new Date(data.expectedStartDate) } : {}),
        ...(data.expectedEndDate ? { expectedEndDate: new Date(data.expectedEndDate) } : {}),
        ...(data.actualStartDate ? { actualStartDate: new Date(data.actualStartDate) } : {}),
        ...(data.actualEndDate ? { actualEndDate: new Date(data.actualEndDate) } : {}),
        ...(data.paymentTerms !== undefined ? { paymentTerms: data.paymentTerms } : {}),
        ...(data.observations !== undefined ? { notes: data.observations } : {}),
        ...(data.discount !== undefined ? { discount: data.discount } : {}),
        ...(data.discountType !== undefined ? { discountType: data.discountType } : {}),
      };

      // Se há itens para atualizar, recalcular totais
      if (data.items) {
        // Remover itens existentes
        await this.prisma.orderItem.deleteMany({
          where: { orderId: id }
        });

        // Calcular valores dos novos itens
        const itemsWithCalculations = data.items.map(item => {
          const subtotal = item.quantity * item.unitPrice;
          const discountValue = item.discountType === 'PERCENTAGE' 
            ? (subtotal * item.discount) / 100 
            : item.discount;
          const total = subtotal - discountValue;

          return {
            ...item,
            subtotal,
            discountValue,
            total
          };
        });

        // Calcular totais da ordem (subtotal derivado dos itens)
        const subtotal = itemsWithCalculations.reduce((sum, item) => sum + item.subtotal, 0);
        const itemsDiscountValue = itemsWithCalculations.reduce((sum, item) => sum + item.discountValue, 0);
        
        const orderDiscountValue = (data.discountType || existingOrder.discountType) === 'PERCENTAGE'
          ? (subtotal * (data.discount ?? existingOrder.discount.toNumber())) / 100
          : (data.discount ?? existingOrder.discount.toNumber());
        
        const totalValue = subtotal - itemsDiscountValue - orderDiscountValue;

        updateData = {
          ...updateData,
          totalValue: totalValue,
          items: {
            create: itemsWithCalculations.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              discountType: item.discountType,
              total: item.total,
              description: item.observations ?? '',
              company: { connect: { id: companyId } },
            }))
          }
        };
      }

      const order = await this.prisma.order.update({
        where: { id },
        data: updateData,
        include: orderWithIncludes.include
      });

      return this.formatOrderResponse(order);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar ordem de serviço', 500);
    }
  }

  /**
   * Exclui uma ordem (soft delete)
   */
  async delete(id: string, companyId: string): Promise<void> {
    try {
      const order = await this.prisma.order.findFirst({
        where: {
          id,
          companyId,
          deletedAt: null
        }
      });

      if (!order) {
        throw new AppError('Ordem de serviço não encontrada', 404);
      }

      if (order.status === 'IN_PRODUCTION' as $Enums.OrderStatus) {
        throw new AppError('Não é possível excluir uma ordem em andamento', 400);
      }

      await this.prisma.order.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir ordem de serviço', 500);
    }
  }

  /**
   * Restaura uma ordem excluída
   */
  async restore(id: string, companyId: string): Promise<OrderResponseDTO> {
    try {
      const order = await this.prisma.order.findFirst({
        where: {
          id,
          companyId,
          deletedAt: { not: null }
        }
      });

      if (!order) {
        throw new AppError('Ordem de serviço não encontrada', 404);
      }

      const restoredOrder = await this.prisma.order.update({
        where: { id },
        data: {
          deletedAt: null
        },
        include: orderWithIncludes.include
      });

      return this.formatOrderResponse(restoredOrder);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao restaurar ordem de serviço', 500);
    }
  }

  /**
   * Atualiza o status de uma ordem
   */
  async updateStatus(id: string, data: UpdateOrderStatusDTO, companyId: string): Promise<OrderResponseDTO> {
    try {
      const order = await this.prisma.order.findFirst({
        where: {
          id,
          companyId,
          deletedAt: null
        }
      });

      if (!order) {
        throw new AppError('Ordem de serviço não encontrada', 404);
      }

      // Validar transição de status
      // Ajuste: tipar o mapa com o enum do Prisma para evitar 'undefined'
      // e mapear o status do DTO para o correspondente do Prisma.
      const validTransitions: Record<$Enums.OrderStatus, $Enums.OrderStatus[]> = {
        PENDING: ['CONFIRMED', 'IN_PRODUCTION', 'CANCELLED'],
        CONFIRMED: ['IN_PRODUCTION', 'CANCELLED'],
        IN_PRODUCTION: ['READY', 'CANCELLED'],
        READY: ['DELIVERED', 'CANCELLED'],
        DELIVERED: [],
        CANCELLED: []
      };

      // Conjunto de possíveis status do Prisma para o status de DTO solicitado
      const prismaTargets = mapDTOStatusToPrisma(data.status);
      // Permitidos a partir do status atual
      const allowedFromCurrent = validTransitions[order.status] ?? [];
      // Selecionar o primeiro alvo válido com base no estado atual
      const selectedTarget = prismaTargets.find(s => allowedFromCurrent.includes(s));

      if (!selectedTarget) {
        // Comentário: antes comparávamos diretamente com strings de DTO,
        // o que causava erro de transição inválida e TS2532 por acesso possivelmente undefined.
        throw new AppError(`Transição de status inválida: ${order.status} -> ${data.status}`, 400);
      }

      const updateData: Record<string, unknown> = {
        // Comentário: gravar sempre o enum do Prisma, não o valor de DTO.
        status: selectedTarget
      };

      // Atualizar datas baseado no status
      // Comentário: regras de datas permanecem baseadas no status de DTO recebido.
      if (data.status === 'IN_PROGRESS' && !order.actualStartDate) {
        updateData.actualStartDate = new Date();
      }

      if (data.status === 'COMPLETED') {
        updateData.actualEndDate = new Date();
      }

      const updatedOrder = await this.prisma.order.update({
        where: { id },
        data: updateData,
        include: orderWithIncludes.include
      });

      return this.formatOrderResponse(updatedOrder);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar status da ordem de serviço', 500);
    }
  }

  // Método removido - campo assignedTo não existe no schema atual
  // async assign(id: string, data: AssignOrderDTO, companyId: string): Promise<OrderResponseDTO> {
  //   throw new Error('Campo assignedTo não implementado no schema atual');
  // }

  async getStats(companyId: string): Promise<OrderStatsDTO> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const total = await this.prisma.order.count({
        where: { companyId, deletedAt: null },
      });

      const byStatus = await this.prisma.order.groupBy({
        by: ['status'],
        where: { companyId, deletedAt: null },
        _count: true,
      });

      const byPriority = await this.prisma.order.groupBy({
        by: ['priority'],
        where: { companyId, deletedAt: null },
        _count: true,
      });

      const totalValue = await this.prisma.order.aggregate({
        where: { companyId, deletedAt: null },
        _sum: { totalValue: true },
        _avg: { totalValue: true },
      });

      const thisMonth = await this.prisma.order.aggregate({
        where: {
          companyId,
          deletedAt: null,
          createdAt: { gte: startOfMonth },
        },
        _count: true,
        _sum: { totalValue: true },
      });

      const lastMonth = await this.prisma.order.aggregate({
        where: {
          companyId,
          deletedAt: null,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _count: true,
        _sum: { totalValue: true },
      });

      const overdue = await this.prisma.order.count({
        where: {
          companyId,
          deletedAt: null,
          status: { in: [$Enums.OrderStatus.PENDING, $Enums.OrderStatus.IN_PRODUCTION] },
          expectedEndDate: { lt: now },
        },
      });

      const totalHours = await this.prisma.orderTimeTracking.aggregate({
        where: {
          order: { companyId, deletedAt: null },
          endTime: { not: null },
        },
        _sum: { duration: true },
      });

      const totalExpenses = await this.prisma.orderExpense.aggregate({
        where: {
          order: { companyId, deletedAt: null },
        },
        _sum: { amount: true },
      });

      const completedOrders = await this.prisma.order.findMany({
        where: {
          companyId,
          deletedAt: null,
          status: { in: [$Enums.OrderStatus.READY, $Enums.OrderStatus.DELIVERED] },
          actualEndDate: { not: null },
        },
        select: { actualStartDate: true, actualEndDate: true },
      });

      const averageCompletionTime =
        completedOrders.length > 0
          ? completedOrders.reduce((sum, order) => {
              const days = Math.ceil(
                (order.actualEndDate!.getTime() -
                  order.actualStartDate!.getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              return sum + days;
            }, 0) / completedOrders.length
          : 0;

      const thisMonthCompleted = await this.prisma.order.aggregate({
        where: {
          companyId,
          deletedAt: null,
          status: { in: [$Enums.OrderStatus.READY, $Enums.OrderStatus.DELIVERED] },
          actualEndDate: { gte: startOfMonth },
        },
        _count: { _all: true },
        _sum: { totalValue: true },
      });

      const lastMonthCompleted = await this.prisma.order.aggregate({
        where: {
          companyId,
          deletedAt: null,
          status: { in: [$Enums.OrderStatus.READY, $Enums.OrderStatus.DELIVERED] },
          actualEndDate: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _count: { _all: true },
        _sum: { totalValue: true },
      });

      const pendingCount = byStatus.find((s) => s.status === $Enums.OrderStatus.PENDING)?._count ?? 0;
      const inProgressCount =
        (byStatus.find((s) => s.status === $Enums.OrderStatus.CONFIRMED)?._count ?? 0) +
        (byStatus.find((s) => s.status === $Enums.OrderStatus.IN_PRODUCTION)?._count ?? 0);
      const pausedCount = 0;
      const completedCount =
        (byStatus.find((s) => s.status === $Enums.OrderStatus.READY)?._count ?? 0) +
        (byStatus.find((s) => s.status === $Enums.OrderStatus.DELIVERED)?._count ?? 0);
      const cancelledCount = byStatus.find((s) => s.status === $Enums.OrderStatus.CANCELLED)?._count ?? 0;

      return {
        total,
        byStatus: {
          pending: pendingCount,
          inProgress: inProgressCount,
          paused: pausedCount,
          completed: completedCount,
          cancelled: cancelledCount,
        },
        byPriority: {
          low: byPriority.find((p) => p.priority === $Enums.OrderPriority.LOW)?._count ?? 0,
          medium: byPriority.find((p) => p.priority === $Enums.OrderPriority.MEDIUM)?._count ?? 0,
          high: byPriority.find((p) => p.priority === $Enums.OrderPriority.HIGH)?._count ?? 0,
          urgent: byPriority.find((p) => p.priority === $Enums.OrderPriority.URGENT)?._count ?? 0,
        },
        totalValue: totalValue._sum.totalValue?.toNumber() ?? 0,
        averageValue: totalValue._avg.totalValue?.toNumber() ?? 0,
        averageCompletionTime,
        thisMonth: {
          total: thisMonth._count ?? 0,
          totalValue: thisMonth._sum.totalValue?.toNumber() ?? 0,
          completed: thisMonthCompleted._count._all ?? 0,
          completedValue:
            thisMonthCompleted._sum.totalValue?.toNumber() ?? 0,
        },
        lastMonth: {
          total: lastMonth._count ?? 0,
          totalValue: lastMonth._sum.totalValue?.toNumber() ?? 0,
          completed: lastMonthCompleted._count._all ?? 0,
          completedValue:
            lastMonthCompleted._sum.totalValue?.toNumber() ?? 0,
        },
        overdue,
        totalHours: totalHours._sum.duration ?? 0,
        totalExpenses: totalExpenses._sum.amount?.toNumber() ?? 0,
      };
    } catch (error) {
      throw new AppError(
        'Erro ao obter estatísticas das ordens de serviço',
        500
      );
    }
  }

  /**
   * Busca ordens para relatório
   */
  async findForReport(filters: OrderFiltersDTO, companyId: string): Promise<OrderReportDTO[]> {
    try {
      const where: Prisma.OrderWhereInput = {
        companyId,
        deletedAt: null
      };

      // Aplicar filtros (mesmo código do findMany)
      if (filters.search) {
        where.OR = [
          { number: { contains: filters.search, mode: 'insensitive' } },
          { title: { contains: filters.search, mode: 'insensitive' } },
          { partner: { name: { contains: filters.search, mode: 'insensitive' } } }
        ];
      }

      if (filters.partnerId) where.partnerId = filters.partnerId;
      if (filters.status) {
        const prismaStatuses = mapDTOStatusToPrisma(filters.status);
        if (prismaStatuses.length > 0) {
          where.status = { in: prismaStatuses };
        }
      }
      if (filters.priority) where.priority = filters.priority;
      // Campo assignedTo não existe no schema atual
      // if (filters.assignedTo) where.assignedTo = filters.assignedTo;

      if (filters.startDate || filters.endDate) {
        where.createdAt = {
          ...(filters.startDate && { gte: new Date(filters.startDate) }),
          ...(filters.endDate && { lte: new Date(filters.endDate) }),
        };
      }

      const orders = await this.prisma.order.findMany({
        where,
        include: {
          partner: {
            select: {
              name: true,
              document: true
            }
          },
          items: true,
          user: {
            select: {
              name: true
            }
          },
          timeTracking: {
            where: {
              endTime: { not: null }
            }
          },
          expenses: true
        },
        orderBy: {
          [filters.sortBy]: filters.sortOrder
        }
      });

      return orders.map((order: any) => ({
        id: order.id,
        number: order.number,
        customerName: order.partner.name,
        customerDocument: order.partner.document,
        title: order.title,
        status: mapOrderStatus(order.status),
        priority: order.priority,
        expectedStartDate: order.expectedStartDate?.toISOString(),
        expectedEndDate: order.expectedEndDate?.toISOString(),
        actualStartDate: order.actualStartDate?.toISOString(),
        actualEndDate: order.actualEndDate?.toISOString(),
        subtotal: order.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0),
        discountValue: (order.discountType === 'PERCENTAGE'
          ? (order.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0) * order.discount) / 100
          : order.discount),
        totalValue: order.totalValue,
        totalHours: order.timeTracking.reduce((sum: number, t: any) => sum + (t.duration || 0), 0),
        totalExpenses: order.expenses.reduce((sum: number, e: any) => sum + e.amount, 0),
        itemsCount: order.items.length,
        // assignedToName: order.assignedToUser?.name, // Campo não existe no schema atual
        createdAt: order.createdAt.toISOString(),
        createdByName: order.user.name
      }));
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar ordens para relatório', 500);
    }
  }

  /**
   * Formata a resposta da ordem
   */
  formatOrderResponse(order: PrismaOrder): OrderResponseDTO {
    // Garantir que todos os campos opcionais sejam tratados adequadamente
    return {
      id: order.id!,
      number: order.number!,
      // Comentário: incluir apenas quando existir; evitar atribuir null a campos string.
      ...(order.quoteId != null ? { quoteId: order.quoteId } : {}),
      ...(order.quote?.number != null ? { quoteNumber: order.quote.number } : {}),
      partnerId: order.partnerId, // Mapeado
      partnerName: order.partner?.name || '',
      partnerDocument: order.partner?.document || '',
      title: order.title || '',
      // Comentário: com exactOptionalPropertyTypes, incluir apenas quando houver valor.
      ...(order.description ? { description: order.description } : {}),
      status: order.status ? mapOrderStatus(order.status) : 'PENDING',
      // 
      priority: order.priority || 'MEDIUM',
      ...(order.expectedStartDate ? { expectedStartDate: order.expectedStartDate } : {}),
      ...(order.expectedEndDate ? { expectedEndDate: order.expectedEndDate } : {}),
      ...(order.actualStartDate ? { actualStartDate: order.actualStartDate } : {}),
      ...(order.actualEndDate ? { actualEndDate: order.actualEndDate } : {}),
      ...(order.paymentTerms ? { paymentTerms: order.paymentTerms } : {}),
      ...(order.notes ? { observations: order.notes } : {}), // Mapeado
      discount: order.discount.toNumber() || 0,
      discountType: (order.discountType || 'PERCENTAGE') as 'FIXED' | 'PERCENTAGE',
      subtotal: order.items?.reduce((sum, item) => sum + (item.quantity.toNumber() * item.unitPrice.toNumber()), 0) || 0,
      discountValue: order.discountType === 'PERCENTAGE' && order.items && order.discount
        ? (order.items.reduce((sum, item) => sum + (item.quantity.toNumber() * item.unitPrice.toNumber()), 0) * order.discount.toNumber()) / 100
        : order.discount.toNumber() || 0,
      totalValue: order.totalValue.toNumber() || 0,
      // assignedTo: undefined,
      // assignedToName: undefined,
      items: order.items.map((item) => ({
        id: item.id,
        // Comentário: com exactOptionalPropertyTypes, incluir productId apenas quando não for null,
        // e garantir narrowing para string.
        ...(item.productId != null ? { productId: item.productId as string } : {}),
        productName: item.product?.name || '',
        productCode: item.product?.sku || '',
        quantity: item.quantity.toNumber(),
        unitPrice: item.unitPrice.toNumber(),
        discount: item.discount.toNumber(),
        discountType: item.discountType as 'FIXED' | 'PERCENTAGE',
        subtotal: item.quantity.toNumber() * item.unitPrice.toNumber(),
        total: item.total.toNumber(),
        // Comentário: incluir 'observations' apenas quando houver descrição.
        ...(item.description ? { observations: item.description } : {}),
      })),
      timeTracking: order.timeTracking.map((tracking) => ({
        id: tracking.id,
        employeeId: tracking.employeeId,
        employeeName: tracking.employee.user.name,
        startTime: tracking.startTime,
        ...(tracking.endTime && { endTime: tracking.endTime }),
        // Comentário: incluir 'duration' apenas quando definido (não null/undefined).
        ...(tracking.duration != null ? { duration: tracking.duration as number } : {}),
        ...(tracking.description ? { description: tracking.description } : {}),
        billable: tracking.billable,
        createdAt: tracking.createdAt,
      })),
      expenses: order.expenses.map((expense) => ({
        id: expense.id,
        description: expense.description,
        amount: expense.amount.toNumber(),
        // Comentário: incluir campos opcionais somente se existirem (não null/undefined).
        ...(expense.category != null ? { category: expense.category as string } : {}),
        date: expense.date,
        ...(expense.receipt != null ? { receipt: expense.receipt as string } : {}),
        billable: expense.billable,
        createdAt: expense.createdAt,
      })),
      totalHours: order.timeTracking.reduce((sum, t) => sum + (t.duration || 0), 0),
      totalExpenses: order.expenses.reduce((sum, e) => sum + e.amount.toNumber(), 0),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      createdBy: order.userId, // Mapeado
      createdByName: order.user.name,
    };
  }
}