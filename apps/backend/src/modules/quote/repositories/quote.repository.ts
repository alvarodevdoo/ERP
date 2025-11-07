import { Prisma, PrismaClient, $Enums } from '@prisma/client';

// Definir o objeto de inclusão para o Prisma
const quoteInclude = {
  include: {
    partner: {
      select: {
        name: true,
        document: true,
      },
    },
    items: {
      include: {
        product: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    },
    user: {
      select: {
        name: true,
      },
    },
  },
};

// Inferir o tipo do Quote com base no objeto de inclusão
type QuoteWithRelations = Prisma.QuoteGetPayload<typeof quoteInclude>;

import { 
  CreateQuoteDTO, 
  UpdateQuoteDTO, 
  QuoteFiltersDTO, 
  QuoteResponseDTO,
  QuoteStatsDTO,
  QuoteReportDTO
} from '../dtos';
import { AppError } from '../../../shared/errors/AppError';

export class QuoteRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Cria um novo orçamento
   */
  async create(data: Prisma.QuoteCreateInput): Promise<QuoteResponseDTO> {
    try {
      const quote = await this.prisma.quote.create({
        data,
        ...quoteInclude,
      });
      return this.mapToResponseDTO(quote);
    } catch (error) {
      // TODO: Adicionar log do erro
      throw new AppError('Erro ao criar orçamento', 500);
    }
  }

  /**
   * Busca orçamento por ID
   */
  async findById(id: string, companyId: string): Promise<QuoteResponseDTO | null> {
    try {
      const quote = await this.prisma.quote.findFirst({
        where: {
          id,
          companyId,
          deletedAt: null
        },
        ...quoteInclude,
      });

      return quote ? this.mapToResponseDTO(quote) : null;
    } catch (error) {
      throw new AppError('Erro ao buscar orçamento', 500);
    }
  }

  /**
   * Lista orçamentos com filtros e paginação
   */
  async findMany(filters: QuoteFiltersDTO, companyId: string): Promise<{
    quotes: QuoteResponseDTO[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const {
        search,
        customerId,
        status,
        startDate,
        endDate,
        minValue,
        maxValue,
        page,
        limit,
        sortBy,
        sortOrder
      } = filters;

      const where: Prisma.QuoteWhereInput = {
        companyId,
        deletedAt: null
      };

      // Filtro de busca
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { number: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          {
            partner: { // Corrigido de customer para partner
              name: { contains: search, mode: 'insensitive' },
            },
          },
        ];
      }

      // Filtro por cliente
      if (customerId) {
        where.partnerId = customerId; // Corrigido de customerId para partnerId
      }

      // Filtro por status
      if (status) {
        where.status = status as $Enums.QuoteStatus;
      }

      // Filtro por período
      if (startDate || endDate) {
        where.createdAt = {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        };
      }

      // Filtro por valor
      if (minValue !== undefined || maxValue !== undefined) {
        where.totalValue = {
          ...(minValue !== undefined && { gte: minValue }),
          ...(maxValue !== undefined && { lte: maxValue }),
        };
      }

      const [quotes, total] = await Promise.all([
        this.prisma.quote.findMany({
          where,
          ...quoteInclude,
          orderBy: { [sortBy]: sortOrder } as any,
          skip: (page - 1) * limit,
          take: limit
        }),
        this.prisma.quote.count({ where })
      ]);

      return {
        quotes: quotes.map(quote => this.mapToResponseDTO(quote)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new AppError('Erro ao listar orçamentos', 500);
    }
  }

  /**
   * Atualiza orçamento
   */
  async update(id: string, data: Prisma.QuoteUpdateInput): Promise<QuoteResponseDTO> {
    try {
      const quote = await this.prisma.quote.update({
        where: { id },
        data,
        ...quoteInclude,
      });
      return this.mapToResponseDTO(quote);
    } catch (error) {
      // TODO: Adicionar log do erro
      throw new AppError('Erro ao atualizar orçamento', 500);
    }
  }

  /**
   * Exclui orçamento (soft delete)
   */
  async delete(id: string, companyId: string): Promise<void> {
    try {
      await this.prisma.quote.update({
        where: {
          id,
          companyId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      throw new AppError('Erro ao excluir orçamento', 500);
    }
  }

  /**
   * Restaura orçamento
   */
  async restore(id: string, companyId: string): Promise<QuoteResponseDTO> {
    try {
      const quote = await this.prisma.quote.update({
        where: {
          id,
          companyId,
        },
        data: {
          deletedAt: null,
          updatedAt: new Date(),
        },
        ...quoteInclude,
      });

      return this.mapToResponseDTO(quote);
    } catch (error) {
      throw new AppError('Erro ao restaurar orçamento', 500);
    }
  }

  /**
   * Atualiza status do orçamento
   */
  async updateStatus(id: string, status: $Enums.QuoteStatus, companyId: string): Promise<QuoteResponseDTO> {
    try {
      const quote = await this.prisma.quote.update({
        where: {
          id,
          companyId,
          deletedAt: null,
        },
        data: {
          status: status,
          updatedAt: new Date(),
        },
        ...quoteInclude,
      });

      return this.mapToResponseDTO(quote);
    } catch (error) {
      throw new AppError('Erro ao atualizar status do orçamento', 500);
    }
  }

  /**
   * Duplica orçamento
   */
  async duplicate(data: Prisma.QuoteCreateInput): Promise<QuoteResponseDTO> {
    try {
      const quote = await this.prisma.quote.create({
        data,
        ...quoteInclude,
      });
      return this.mapToResponseDTO(quote);
    } catch (error) {
      // TODO: Adicionar log do erro
      throw new AppError('Erro ao duplicar orçamento', 500);
    }
  }

  /**
   * Obtém estatísticas de orçamentos
   */
  async getStats(companyId: string): Promise<QuoteStatsDTO> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const [total, byStatus, totalValue, thisMonth, lastMonth] = await Promise.all([
        this.prisma.quote.count({
          where: { companyId, deletedAt: null }
        }),
        this.prisma.quote.groupBy({
          by: ['status'],
          where: { companyId, deletedAt: null },
          _count: true
        }),
        this.prisma.quote.aggregate({
          where: { companyId, deletedAt: null },
          _sum: { totalValue: true },
          _avg: { totalValue: true }
        }),
        this.prisma.quote.aggregate({
          where: {
            companyId,
            deletedAt: null,
            createdAt: { gte: startOfMonth }
          },
          _count: true,
          _sum: { totalValue: true }
        }),
        this.prisma.quote.aggregate({
          where: {
            companyId,
            deletedAt: null,
            createdAt: {
              gte: startOfLastMonth,
              lte: endOfLastMonth
            }
          },
          _count: true,
          _sum: { totalValue: true }
        })
      ]);

      const [thisMonthApproved, lastMonthApproved, sentQuotes] = await Promise.all([
        this.prisma.quote.aggregate({
          where: {
            companyId,
            deletedAt: null,
            status: 'APPROVED',
            createdAt: { gte: startOfMonth }
          },
          _count: true,
          _sum: { totalValue: true }
        }),
        this.prisma.quote.aggregate({
          where: {
            companyId,
            deletedAt: null,
            status: 'APPROVED',
            createdAt: {
              gte: startOfLastMonth,
              lte: endOfLastMonth
            }
          },
          _count: true,
          _sum: { totalValue: true }
        }),
        this.prisma.quote.count({
          where: {
            companyId,
            deletedAt: null,
            status: { in: ['SENT', 'APPROVED', 'REJECTED'] }
          }
        })
      ]);

      const statusMap = byStatus.reduce<Record<string, number>>((acc, item) => {
        acc[item.status.toLowerCase()] = item._count;
        return acc;
      }, {} as Record<string, number>);

      const conversionRate = sentQuotes > 0 ? (statusMap.approved || 0) / sentQuotes * 100 : 0;

      return {
        total,
        byStatus: {
          draft: statusMap.draft || 0,
          sent: statusMap.sent || 0,
          approved: statusMap.approved || 0,
          rejected: statusMap.rejected || 0,
          expired: statusMap.expired || 0,
          converted: statusMap.converted || 0
        },
        totalValue: totalValue._sum.totalValue?.toNumber() || 0,
        averageValue: totalValue._avg.totalValue?.toNumber() || 0,
        conversionRate,
        thisMonth: {
          total: thisMonth._count,
          totalValue: thisMonth._sum.totalValue?.toNumber() || 0,
          approved: thisMonthApproved._count,
          approvedValue: thisMonthApproved._sum.totalValue?.toNumber() || 0,
        },
        lastMonth: {
          total: lastMonth._count,
          totalValue: lastMonth._sum.totalValue?.toNumber() || 0,
          approved: lastMonthApproved._count,
          approvedValue: lastMonthApproved._sum.totalValue?.toNumber() || 0,
        },
      };
    } catch (error) {
      throw new AppError('Erro ao obter estatísticas', 500);
    }
  }

  /**
   * Busca orçamentos para relatório
   */
  async findForReport(filters: QuoteFiltersDTO, companyId: string): Promise<QuoteReportDTO[]> {
    try {
      const where: Prisma.QuoteWhereInput = {
        companyId,
        deletedAt: null
      };

      // Aplica filtros similares ao findMany
      // 
      // O modelo Prisma usa partnerId (não customerId)
      if (filters.customerId) where.partnerId = filters.customerId;
      if (filters.status) where.status = filters.status as $Enums.QuoteStatus;
      if (filters.startDate || filters.endDate) {
        where.createdAt = {
          ...(filters.startDate && { gte: new Date(filters.startDate) }),
          ...(filters.endDate && { lte: new Date(filters.endDate) }),
        };
      }

      const quotes = await this.prisma.quote.findMany({
        where,
        select: {
          id: true,
          number: true,
          title: true,
          status: true,
          validUntil: true,
          subtotal: true,
          discount: true,
          totalValue: true,
          createdAt: true,
          partner: {
            select: {
              name: true,
              document: true,
            },
          },
          items: {
            select: {
              id: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return quotes.map(quote => ({
        id: quote.id,
        number: quote.number,
        customerName: quote.partner.name,
        customerDocument: quote.partner.document,
        title: quote.title,
        status: quote.status,
        validUntil: quote.validUntil.toISOString(),
        subtotal: quote.subtotal.toNumber(),
        discountValue: quote.discount.toNumber(), // O relatório parece querer o desconto do orçamento, não o calculado
        totalValue: quote.totalValue.toNumber(),
        itemsCount: quote.items.length,
        createdAt: quote.createdAt.toISOString(),
        createdByName: quote.user.name,
      }));
    } catch (error) {
      throw new AppError('Erro ao gerar relatório', 500);
    }
  }

  /**
   * Gera próximo número sequencial
   */
  private generateNextNumber(lastNumber?: string | null): string {
    if (!lastNumber) {
      return 'ORC-000001';
    }

    const parts = lastNumber.split('-');
    if (parts.length !== 2) {
      return 'ORC-000001'; // Retorna o padrão se o formato for inesperado
    }

    const numberPart = parseInt(parts[1] ?? '', 10);
    if (isNaN(numberPart)) {
      return 'ORC-000001'; // Retorna o padrão se a parte numérica não for um número
    }

    const nextNumber = (numberPart + 1).toString().padStart(6, '0');
    return `ORC-${nextNumber}`;
  }



  private mapToResponseDTO(quote: QuoteWithRelations): QuoteResponseDTO {
    const items = quote.items.map(item => {
      const subtotal = item.quantity.toNumber() * item.unitPrice.toNumber();
      const discountValue = item.discountType === 'PERCENTAGE'
        ? subtotal * (item.discount.toNumber() / 100)
        : item.discount.toNumber();
      const itemTotal = subtotal - discountValue;

      return {
        id: item.id,
        productId: item.productId || '',
        productName: item.product?.name || '',
        productCode: item.product?.code || '',
        quantity: item.quantity.toNumber(),
        unitPrice: item.unitPrice.toNumber(),
        discount: item.discount.toNumber(),
        discountType: item.discountType,
        subtotal: subtotal,
        discountValue: discountValue,
        total: itemTotal,
        ...(item.description ? { observations: item.description } : {}), // Mapeado
      };
    });

    const subtotal = items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
    const itemsDiscountValue = items.reduce((sum: number, item: any) => sum + item.discountValue, 0);
    const quoteDiscountValue = quote.discountType === 'PERCENTAGE'
      ? subtotal * (quote.discount.toNumber() / 100)
      : quote.discount.toNumber();

    return {
      id: quote.id,
      number: quote.number,
      customerId: quote.partnerId, // Mapeado
      customerName: quote.partner?.name || '',
      ...(quote.partner?.document ? { customerDocument: quote.partner.document } : {}),
      title: quote.title,
      ...(quote.description ? { description: quote.description } : {}),
      status: quote.status,
      validUntil: quote.validUntil,
      ...(quote.paymentTerms ? { paymentTerms: quote.paymentTerms } : {}),
      ...(quote.deliveryTerms ? { deliveryTerms: quote.deliveryTerms } : {}),
      ...(quote.notes ? { observations: quote.notes } : {}), // Mapeado
      discount: quote.discount.toNumber(),
      discountType: quote.discountType,
      subtotal: quote.subtotal.toNumber(),
      discountValue: quoteDiscountValue,
      totalValue: quote.totalValue.toNumber(),
      items,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      createdBy: quote.userId, // Mapeado
      createdByName: quote.user?.name || '',
    };
  }
}