import { Prisma, PrismaClient } from '@prisma/client';
import {
  CreateQuoteDTO,
  UpdateQuoteDTO,
  QuoteFiltersDTO,
  UpdateQuoteStatusDTO,
  DuplicateQuoteDTO,
  ConvertToOrderRequestDTO,
  QuoteResponseDTO,
  QuoteStatsDTO,
  QuoteReportDTO,
  ConvertToOrderDTO
} from '../dtos';
import { QuoteRepository } from '../repositories';
import { RoleService } from '../../role/services/role.service';
import { AppError } from '../../../shared/errors/AppError';
import { RoleRepository } from '../../role/repositories/role.repository';

export class QuoteService {
  private quoteRepository: QuoteRepository;
  private roleService: RoleService;

  constructor(
    private prisma: PrismaClient,
    roleService?: RoleService
  ) {
    this.quoteRepository = new QuoteRepository(prisma);
    this.roleService = roleService || new RoleService(new RoleRepository(prisma));
  }

  async create(data: CreateQuoteDTO, userId: string, companyId: string): Promise<QuoteResponseDTO> {
    await this.roleService.checkPermission({ userId, permission: 'create', resource: 'quotes' });
    await this.validateQuoteData(data, companyId);
    const normalizedData = this.normalizeQuoteData(data);
    const { itemsWithTotals, subtotal, totalValue } = this._calculateQuoteTotals(normalizedData.items, {
      discount: normalizedData.discount,
      discountType: normalizedData.discountType,
    });
    const lastQuote = await this.prisma.quote.findFirst({
      where: { companyId },
      orderBy: { number: 'desc' },
      select: { number: true },
    });
    const nextNumber = this.generateNextNumber(lastQuote?.number);

    const createInput: Prisma.QuoteCreateInput = {
      number: nextNumber,
      title: normalizedData.title,
      description: normalizedData.description ?? null,
      validUntil: new Date(normalizedData.validUntil),
      paymentTerms: normalizedData.paymentTerms ?? null,
      deliveryTerms: normalizedData.deliveryTerms ?? null,
      notes: normalizedData.observations ?? null,
      status: 'DRAFT',
      discount: new Prisma.Decimal(normalizedData.discount),
      discountType: normalizedData.discountType,
      subtotal: new Prisma.Decimal(subtotal),
      totalValue: new Prisma.Decimal(totalValue),
      company: { connect: { id: companyId } },
      partner: { connect: { id: normalizedData.customerId } },
      user: { connect: { id: userId } },
      items: {
        create: itemsWithTotals.map(item => ({
          description: item.observations || '',
          quantity: new Prisma.Decimal(item.quantity),
          unitPrice: new Prisma.Decimal(item.unitPrice),
          discount: new Prisma.Decimal(item.discount),
          discountType: item.discountType,
          total: new Prisma.Decimal(item.total),
          company: { connect: { id: companyId } },
          product: { connect: { id: item.productId } },
        })),
      },
    };

    return await this.quoteRepository.create(createInput);
  }

  async findById(id: string, userId: string, companyId: string): Promise<QuoteResponseDTO> {
    await this.roleService.checkPermission({ userId, permission: 'read', resource: 'quotes' });
    const quote = await this.quoteRepository.findById(id, companyId);
    if (!quote) {
      throw new AppError('Orçamento não encontrado', 404);
    }
    return quote;
  }

  async findMany(filters: QuoteFiltersDTO, userId: string, companyId: string): Promise<{
    quotes: QuoteResponseDTO[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    await this.roleService.checkPermission({ userId, permission: 'read', resource: 'quotes' });
    return await this.quoteRepository.findMany(filters, companyId);
  }

  async update(id: string, data: UpdateQuoteDTO, userId: string, companyId: string): Promise<QuoteResponseDTO> {
    await this.roleService.checkPermission({ userId, permission: 'update', resource: 'quotes' });
    const existingQuote = await this.quoteRepository.findById(id, companyId);
    if (!existingQuote) {
      throw new AppError('Orçamento não encontrado', 404);
    }
    this.validateQuoteForEdit(existingQuote);
    if (data.customerId || data.items) {
      await this.validateQuoteData(data as CreateQuoteDTO, companyId);
    }
    const normalizedData = this.normalizeQuoteData(data);
    const itemsToUpdate = normalizedData.items || existingQuote.items;
    const discountToUpdate = {
      discount: normalizedData.discount ?? existingQuote.discount,
      discountType: normalizedData.discountType ?? existingQuote.discountType,
    };
    const { itemsWithTotals, subtotal, totalValue } = this._calculateQuoteTotals(itemsToUpdate, discountToUpdate);
    const updateInput: Prisma.QuoteUpdateInput = {
      // adicionar somente campos definidos para evitar undefined
      ...(normalizedData.title !== undefined && { title: normalizedData.title }),
      ...(normalizedData.description !== undefined && { description: normalizedData.description ?? null }),
      ...(normalizedData.validUntil !== undefined && { validUntil: new Date(normalizedData.validUntil) }),
      ...(normalizedData.paymentTerms !== undefined && { paymentTerms: normalizedData.paymentTerms ?? null }),
      ...(normalizedData.deliveryTerms !== undefined && { deliveryTerms: normalizedData.deliveryTerms ?? null }),
      ...(normalizedData.observations !== undefined && { notes: normalizedData.observations ?? null }),
      discount: new Prisma.Decimal(discountToUpdate.discount),
      discountType: discountToUpdate.discountType,
      subtotal: new Prisma.Decimal(subtotal),
      totalValue: new Prisma.Decimal(totalValue),
      updatedAt: new Date(),
      ...(normalizedData.customerId && { partner: { connect: { id: normalizedData.customerId } } }),
      ...(normalizedData.items && {
        items: {
          deleteMany: {},
          create: itemsWithTotals.map(item => ({
            description: item.observations || '',
            quantity: new Prisma.Decimal(item.quantity),
            unitPrice: new Prisma.Decimal(item.unitPrice),
            discount: new Prisma.Decimal(item.discount),
            discountType: item.discountType,
            total: new Prisma.Decimal(item.total),
            company: { connect: { id: companyId } },
            product: { connect: { id: item.productId } },
          })),
        },
      }),
    };
    return await this.quoteRepository.update(id, updateInput);
  }

  async delete(id: string, userId: string, companyId: string): Promise<void> {
    await this.roleService.checkPermission({ userId, permission: 'delete', resource: 'quotes' });
    const quote = await this.quoteRepository.findById(id, companyId);
    if (!quote) {
      throw new AppError('Orçamento não encontrado', 404);
    }
    this.validateQuoteForDeletion(quote);
    await this.quoteRepository.delete(id, companyId);
  }

  async restore(id: string, userId: string, companyId: string): Promise<QuoteResponseDTO> {
    await this.roleService.checkPermission({ userId, permission: 'update', resource: 'quotes' });
    return await this.quoteRepository.restore(id, companyId);
  }

  async updateStatus(id: string, data: UpdateQuoteStatusDTO, userId: string, companyId: string): Promise<QuoteResponseDTO> {
    await this.roleService.checkPermission({ userId, permission: 'update', resource: 'quotes' });
    const quote = await this.quoteRepository.findById(id, companyId);
    if (!quote) {
      throw new AppError('Orçamento não encontrado', 404);
    }
    this.validateStatusTransition(quote.status, data.status);
    if (data.status === 'APPROVED' && new Date() > new Date(quote.validUntil)) {
      throw new AppError('Não é possível aprovar um orçamento expirado', 400);
    }
    return await this.quoteRepository.updateStatus(id, data.status, companyId);
  }

  async duplicate(id: string, data: DuplicateQuoteDTO, userId: string, companyId: string): Promise<QuoteResponseDTO> {
    await this.roleService.checkPermission({ userId, permission: 'create', resource: 'quotes' });
    const originalQuote = await this.quoteRepository.findById(id, companyId);
    if (!originalQuote) {
      throw new AppError('Orçamento original não encontrado', 404);
    }
    if (data.customerId) {
      const customerExists = await this.prisma.partner.findFirst({
        where: {
          id: data.customerId,
          companyId,
          type: { in: ['CUSTOMER', 'BOTH'] },
          isActive: true
        },
      });
      if (!customerExists) {
        throw new AppError('Cliente não encontrado', 404);
      }
    }
    const { itemsWithTotals, subtotal, totalValue } = this._calculateQuoteTotals(
      originalQuote.items,
      {
        discount: originalQuote.discount,
        discountType: originalQuote.discountType,
      },
    );
    const nextNumber = this.generateNextNumber(
      (await this.prisma.quote.findFirst({ where: { companyId }, orderBy: { number: 'desc' } }))?.number,
    );
    const createInput: Prisma.QuoteCreateInput = {
      number: nextNumber,
      title: data.title || `${originalQuote.title} (Cópia)`,
      description: originalQuote.description ?? null,
      validUntil: data.validUntil ? new Date(data.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paymentTerms: originalQuote.paymentTerms ?? null,
      deliveryTerms: originalQuote.deliveryTerms ?? null,
      notes: originalQuote.observations ?? null,
      status: 'DRAFT',
      discount: new Prisma.Decimal(originalQuote.discount),
      discountType: originalQuote.discountType,
      subtotal: new Prisma.Decimal(subtotal),
      totalValue: new Prisma.Decimal(totalValue),
      company: { connect: { id: companyId } },
      partner: { connect: { id: data.customerId || originalQuote.customerId } },
      user: { connect: { id: userId } },
      items: {
        create: itemsWithTotals.map(item => ({
          description: item.observations || '',
          quantity: new Prisma.Decimal(item.quantity),
          unitPrice: new Prisma.Decimal(item.unitPrice),
          discount: new Prisma.Decimal(item.discount),
          discountType: item.discountType,
          total: new Prisma.Decimal(item.total),
          company: { connect: { id: companyId } },
          product: { connect: { id: item.productId } },
        })),
      },
    };
    return await this.quoteRepository.duplicate(createInput);
  }

  async convertToOrder(id: string, data: ConvertToOrderRequestDTO, userId: string, companyId: string): Promise<ConvertToOrderDTO> {
    await this.roleService.checkPermission({ userId, permission: 'update', resource: 'quotes' });
    await this.roleService.checkPermission({ userId, permission: 'create', resource: 'orders' });

    const quote = await this.quoteRepository.findById(id, companyId);
    if (!quote) {
      throw new AppError('Orçamento não encontrado', 404);
    }

    if (quote.status !== 'APPROVED') {
      throw new AppError('Apenas orçamentos aprovados podem ser convertidos em OS', 400);
    }

    const existingOrder = await this.prisma.order.findFirst({
      where: {
        quoteId: id,
        companyId,
        deletedAt: null
      }
    });

    if (existingOrder) {
      throw new AppError('Este orçamento já foi convertido em OS', 400);
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const lastOrder = await tx.order.findFirst({
          where: { companyId },
          orderBy: { number: 'desc' },
          select: { number: true }
        });

        const nextNumber = this.generateNextOrderNumber(lastOrder?.number);

        const order = await tx.order.create({
          data: {
            number: nextNumber,
            title: quote.title,
            description: quote.description ?? null,
            paymentTerms: quote.paymentTerms ?? null,
            notes: quote.observations ?? null,
            status: 'PENDING',
            discount: new Prisma.Decimal(quote.discount),
            subtotal: new Prisma.Decimal(quote.subtotal),
            totalValue: new Prisma.Decimal(quote.totalValue),
            company: { connect: { id: companyId } },
            partner: { connect: { id: quote.customerId } },
            user: { connect: { id: userId } },
            quote: { connect: { id: id } },
            items: {
              create: quote.items.map(item => ({
                description: item.observations || '',
                quantity: new Prisma.Decimal(item.quantity),
                unitPrice: new Prisma.Decimal(item.unitPrice),
                discount: new Prisma.Decimal(item.discount),
                total: new Prisma.Decimal(item.total),
                company: { connect: { id: companyId } },
                product: { connect: { id: item.productId } },
              })),
            },
          },
        });

        await tx.quote.update({
          where: { id },
          data: { status: 'CONVERTED' }
        });

        return order;
      });

      return {
        orderId: result.id,
        orderNumber: result.number,
        message: 'Orçamento convertido em OS com sucesso'
      };
    } catch {
      throw new AppError('Erro ao converter orçamento em OS', 500);
    }
  }

  async getStats(userId: string, companyId: string): Promise<QuoteStatsDTO> {
    await this.roleService.checkPermission({ userId, permission: 'read', resource: 'quotes' });
    return await this.quoteRepository.getStats(companyId);
  }

  async generateReport(filters: QuoteFiltersDTO, format: 'json' | 'csv', userId: string, companyId: string): Promise<QuoteReportDTO[] | string> {
    await this.roleService.checkPermission({ userId, permission: 'read', resource: 'quotes' });
    const data = await this.quoteRepository.findForReport(filters, companyId);
    if (format === 'csv') {
      return this.generateCSVReport(data);
    }
    return data;
  }

  private async validateQuoteData(data: CreateQuoteDTO | UpdateQuoteDTO, companyId: string): Promise<void> {
    if ('customerId' in data && data.customerId) {
      const customer = await this.prisma.partner.findFirst({
        where: {
          id: data.customerId,
          companyId,
          type: 'CUSTOMER',
          isActive: true
        }
      });
      if (!customer) {
        throw new AppError('Cliente não encontrado', 404);
      }
      if (!customer.isActive) {
        throw new AppError('Cliente está bloqueado', 400);
      }
    }
    if ('items' in data && data.items && data.items.length > 0) {
      for (const item of data.items) {
        const product = await this.prisma.product.findFirst({
          where: {
            id: item.productId,
            companyId,
            isActive: true
          }
        });
        if (!product) {
          throw new AppError(`Produto ${item.productId} não encontrado`, 404);
        }
        if (!product.isActive) {
          throw new AppError(`Produto ${product.name} está inativo`, 400);
        }
        if (item.quantity <= 0) {
          throw new AppError('Quantidade deve ser maior que zero', 400);
        }
        if (item.unitPrice < 0) {
          throw new AppError('Preço unitário não pode ser negativo', 400);
        }
        if (item.discount < 0) {
          throw new AppError('Desconto não pode ser negativo', 400);
        }
        if (item.discountType === 'PERCENTAGE' && item.discount > 100) {
          throw new AppError('Desconto percentual não pode ser maior que 100%', 400);
        }
      }
    }
    if ('validUntil' in data && data.validUntil) {
      const validUntil = new Date(data.validUntil);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (validUntil < today) {
        throw new AppError('Data de validade não pode ser anterior a hoje', 400);
      }
    }
    if ('discount' in data && data.discount !== undefined) {
      if (data.discount < 0) {
        throw new AppError('Desconto não pode ser negativo', 400);
      }
      if (data.discountType === 'PERCENTAGE' && data.discount > 100) {
        throw new AppError('Desconto percentual não pode ser maior que 100%', 400);
      }
    }
  }

  private normalizeQuoteData(data: CreateQuoteDTO): CreateQuoteDTO;
  private normalizeQuoteData(data: UpdateQuoteDTO): UpdateQuoteDTO;
  private normalizeQuoteData(data: CreateQuoteDTO | UpdateQuoteDTO): CreateQuoteDTO | UpdateQuoteDTO {
    const normalized = { ...data };
    if (normalized.title) {
      normalized.title = normalized.title.trim();
    }
    if (normalized.description) {
      normalized.description = normalized.description.trim();
    }
    if (normalized.paymentTerms) {
      normalized.paymentTerms = normalized.paymentTerms.trim();
    }
    if (normalized.deliveryTerms) {
      normalized.deliveryTerms = normalized.deliveryTerms.trim();
    }
    if (normalized.observations) {
      normalized.observations = normalized.observations.trim();
    }
    if ('items' in normalized && normalized.items) {
      normalized.items = normalized.items.map(item => ({
        ...item,
        observations: item.observations?.trim()
      }));
    }
    return normalized;
  }

  private validateQuoteForEdit(quote: QuoteResponseDTO): void {
    if (quote.status === 'REJECTED') { // Placeholder
      throw new AppError('Orçamentos convertidos em OS não podem ser editados', 400);
    }
  }

  private validateQuoteForDeletion(quote: QuoteResponseDTO): void {
    if (quote.status === 'REJECTED') { // Placeholder
      throw new AppError('Orçamentos convertidos em OS não podem ser excluídos', 400);
    }
    if (quote.status === 'APPROVED') {
      throw new AppError('Orçamentos aprovados não podem ser excluídos', 400);
    }
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      'DRAFT': ['SENT', 'EXPIRED'],
      'SENT': ['APPROVED', 'REJECTED', 'EXPIRED'],
      'APPROVED': [], // Placeholder
      'REJECTED': ['SENT'],
      'EXPIRED': ['SENT'],
    };
    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new AppError(`Transição de status inválida: ${currentStatus} -> ${newStatus}`, 400);
    }
  }

  private generateNextOrderNumber(lastNumber?: string): string {
    if (!lastNumber) {
      return 'OS-000001';
    }
    const parts = lastNumber.split('-');
    if (parts.length !== 2) {
      return 'OS-000001';
    }
    const parsed = parseInt(parts[1] ?? '0', 10);
    if (isNaN(parsed)) {
      return 'OS-000001';
    }
    const nextNumber = (parsed + 1).toString().padStart(6, '0');
    return `OS-${nextNumber}`;
  }

  private generateCSVReport(data: QuoteReportDTO[]): string {
    const headers = [
      'Número',
      'Cliente',
      'Documento',
      'Título',
      'Status',
      'Válido até',
      'Subtotal',
      'Desconto',
      'Total',
      'Itens',
      'Criado em',
      'Criado por'
    ];
    const rows = data.map(quote => [
      quote.number,
      quote.customerName,
      quote.customerDocument,
      quote.title,
      quote.status,
      new Date(quote.validUntil).toLocaleDateString('pt-BR'),
      quote.subtotal.toFixed(2),
      quote.discountValue.toFixed(2),
      quote.totalValue.toFixed(2),
      quote.itemsCount.toString(),
      new Date(quote.createdAt).toLocaleDateString('pt-BR'),
      quote.createdByName
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    return csvContent;
  }

  private _calculateQuoteTotals(items: any[], quoteDiscount: { discount: number; discountType: 'PERCENTAGE' | 'FIXED' }) {
    const itemsWithTotals = items.map(item => {
      const subtotal = item.quantity * item.unitPrice;
      const discountValue = item.discountType === 'PERCENTAGE'
        ? subtotal * (item.discount / 100)
        : item.discount;
      const total = subtotal - discountValue;
      return { ...item, subtotal, discountValue, total };
    });

    const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.subtotal, 0);
    const itemsDiscountValue = itemsWithTotals.reduce((sum, item) => sum + item.discountValue, 0);

    const quoteDiscountValue = quoteDiscount.discountType === 'PERCENTAGE'
      ? subtotal * (quoteDiscount.discount / 100)
      : quoteDiscount.discount;

    const totalValue = subtotal - itemsDiscountValue - quoteDiscountValue;

    return {
      itemsWithTotals,
      subtotal,
      totalDiscount: itemsDiscountValue + quoteDiscountValue,
      totalValue,
    };
  }

  private generateNextNumber(lastNumber?: string | null): string {
    if (!lastNumber) {
      return 'ORC-000001';
    }

    const parts = lastNumber.split('-');
    if (parts.length !== 2) {
      return 'ORC-000001';
    }

    const numberPart = parseInt(parts[1] ?? '0', 10);
    if (isNaN(numberPart)) {
      return 'ORC-000001';
    }

    const nextNumber = (numberPart + 1).toString().padStart(6, '0');
    return `ORC-${nextNumber}`;
  }
}
