import { PrismaClient, Prisma } from '@prisma/client';
import {
  StockMovementDTO,
  StockReservationDTO,
  CancelStockReservationDTO,
  StockFiltersDTO,
  StockMovementFiltersDTO,
  StockReservationFiltersDTO,
  CreateStockLocationDTO,
  UpdateStockLocationDTO,
  StockItemResponseDTO,
  StockMovementResponseDTO,
  StockReservationResponseDTO,
  StockLocationResponseDTO,
  StockStatsDTO,
  StockReportDTO,
  StockMovementReportDTO,
} from '../dtos';

export class StockRepository {
  constructor(private prisma: PrismaClient) {}

  async findStockItem(
    productId: string,
    locationId: string | undefined,
    companyId: string,
  ): Promise<StockItemResponseDTO | null> {
    const stockItem = await this.prisma.stockItem.findFirst({
      where: {
        productId,
        ...(locationId ? { locationId } : {}),
        companyId,
        deletedAt: null,
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
            category: true,
          },
        },
        location: {
          select: {
            name: true,
          },
        },
        batches: {
          where: {
            quantity: { gt: 0 },
            deletedAt: null,
          },
          orderBy: {
            expirationDate: 'asc',
          },
        },
      },
    });

    if (!stockItem || !stockItem.product) return null;

    return {
      id: stockItem.id,
      productId: stockItem.productId,
      productName: stockItem.product.name,
      productCode: stockItem.product.sku,
      productCategory: stockItem.product.category?.name ?? '',
      locationId: stockItem.locationId,
      locationName: stockItem.location?.name || null,
      quantity: stockItem.quantity.toNumber(),
      reservedQuantity: stockItem.reservedQuantity.toNumber(),
      availableQuantity: stockItem.quantity.minus(stockItem.reservedQuantity).toNumber(),
      unitCost: stockItem.unitCost.toNumber(),
      totalValue: stockItem.quantity.mul(stockItem.unitCost).toNumber(),
      minStock: stockItem.minStock,
      maxStock: stockItem.maxStock,
      isLowStock: stockItem.quantity.lte(stockItem.minStock),
      isOutOfStock: stockItem.quantity.lte(0),
      lastMovementAt: stockItem.lastMovementAt?.toISOString() || null,
      lastMovementType: stockItem.lastMovementType,
      batches: stockItem.batches.map((batch: any) => ({
        id: batch.id,
        batchNumber: batch.batchNumber,
        quantity: batch.quantity.toNumber(),
        unitCost: batch.unitCost.toNumber(),
        expirationDate: batch.expirationDate?.toISOString() || null,
        isExpired: batch.expirationDate ? batch.expirationDate < new Date() : false,
        createdAt: batch.createdAt.toISOString(),
      })),
      createdAt: stockItem.createdAt.toISOString(),
      updatedAt: stockItem.updatedAt.toISOString(),
    };
  }

  async findMany(
    filters: StockFiltersDTO,
    companyId: string,
  ): Promise<{ items: StockItemResponseDTO[]; total: number }> {
    const where: Prisma.StockItemWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.locationId) {
      where.locationId = filters.locationId;
    }

    if (filters.category) {
      // Filtrar pelo nome da categoria relacionada (ProductCategory)
      where.product = {
        category: {
          name: {
            contains: filters.category,
            mode: 'insensitive',
          },
        },
      };
    }

    if (filters.search) {
      where.OR = [
        {
          product: {
            name: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        },
        {
          product: {
            sku: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    if (filters.lowStock) {
      where.quantity = {
        lte: 10, // threshold padrão para estoque baixo
      };
    }

    if (filters.outOfStock) {
      where.quantity = {
        lte: 0,
      };
    }

    const orderBy: Prisma.StockItemOrderByWithRelationInput = (() => {
      const sortOrder = filters.sortOrder;
      switch (filters.sortBy) {
        case 'quantity':
          return { quantity: sortOrder };
        case 'unitCost':
          return { unitCost: sortOrder };
        case 'productName':
          return { product: { name: sortOrder } };
        default:
          return { createdAt: 'desc' };
      }
    })();

    const [items, total] = await Promise.all([
      this.prisma.stockItem.findMany({
        where,
        include: {
          product: {
            select: {
              name: true,
              sku: true,
              category: { select: { name: true } },
            },
          },
          location: {
            select: {
              name: true,
            },
          },
          batches: {
            where: {
              quantity: { gt: 0 },
              deletedAt: null,
            },
            orderBy: {
              expirationDate: 'asc',
            },
          },
        },
        orderBy,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.stockItem.count({ where }),
    ]);

    return {
      items: items
        .filter((item): item is typeof item & { product: NonNullable<typeof item.product> } => !!item.product)
        .map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          productCode: item.product.sku,
          productCategory: item.product.category?.name ?? '',
          locationId: item.locationId,
          locationName: item.location?.name || null,
          quantity: item.quantity.toNumber(),
          reservedQuantity: item.reservedQuantity.toNumber(),
          availableQuantity: item.quantity.minus(item.reservedQuantity).toNumber(),
          unitCost: item.unitCost.toNumber(),
          totalValue: item.quantity.mul(item.unitCost).toNumber(),
          minStock: item.minStock,
          maxStock: item.maxStock,
          isLowStock: item.quantity.lte(item.minStock),
          isOutOfStock: item.quantity.lte(0),
          lastMovementAt: item.lastMovementAt?.toISOString() || null,
          lastMovementType: item.lastMovementType,
          batches: item.batches.map((batch: any) => ({
            id: batch.id,
            batchNumber: batch.batchNumber,
            quantity: batch.quantity.toNumber(),
            unitCost: batch.unitCost.toNumber(),
            expirationDate: batch.expirationDate?.toISOString() || null,
            isExpired: batch.expirationDate ? batch.expirationDate < new Date() : false,
            createdAt: batch.createdAt.toISOString(),
          })),
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        })),
      total,
    };
  }

  async createMovement(
    data: StockMovementDTO,
    userId: string,
    companyId: string,
  ): Promise<StockMovementResponseDTO> {
    const totalCost = data.unitCost ? new Prisma.Decimal(data.quantity).mul(data.unitCost) : null;

    const movement = await this.prisma.stockMovement.create({
      data: {
        productId: data.productId,
        type: data.type,
        quantity: data.quantity,
        unitCost: data.unitCost ?? null,
        totalCost,
        reason: data.reason,
        reference: data.reference ?? null,
        fromLocationId: data.locationId ?? null,
        toLocationId: data.destinationLocationId ?? null,
        notes: data.notes ?? null,
        userId,
        companyId,
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
        fromLocation: {
          select: {
            name: true,
          },
        },
        toLocation: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      id: movement.id,
      productId: movement.productId,
      productName: (movement as any).product?.name || null,
      productCode: (movement as any).product?.sku || null,
      type: movement.type as 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER',
      quantity: movement.quantity.toNumber(),
      unitCost: movement.unitCost?.toNumber() || null,
      totalCost: movement.totalCost?.toNumber() || null,
      reason: movement.reason,
      reference: movement.reference,
      locationId: movement.fromLocationId,
      locationName: (movement as any).fromLocation?.name || null,
      destinationLocationId: movement.toLocationId,
      destinationLocationName: (movement as any).toLocation?.name || null,
      notes: movement.notes,
      userId: movement.userId,
      userName: (movement as any).user?.name || null,
      createdAt: movement.createdAt.toISOString(),
      batchNumber: null, // Add missing properties
      expirationDate: null, // Add missing properties
    };
  }

  async updateStockQuantity(
    productId: string,
    locationId: string,
    quantityChange: number,
    companyId: string,
    unitCost?: number,
  ): Promise<void> {
    const stockItem = await this.prisma.stockItem.findFirst({
      where: {
        productId,
        locationId,
        companyId,
        deletedAt: null,
      },
    });

    if (stockItem) {
      await this.prisma.stockItem.update({
        where: { id: stockItem.id },
        data: {
          quantity: stockItem.quantity.add(quantityChange),
          unitCost: unitCost || stockItem.unitCost,
          lastMovementAt: new Date(),
          lastMovementType: quantityChange > 0 ? 'IN' : 'OUT',
        },
      });
    } else if (quantityChange > 0) {
      await this.prisma.stockItem.create({
        data: {
          productId,
          locationId,
          companyId,
          quantity: quantityChange,
          reservedQuantity: 0,
          unitCost: unitCost || 0,
          minStock: 0,
          maxStock: 0,
          lastMovementAt: new Date(),
          lastMovementType: 'IN',
        },
      });
    }
  }

  async findMovements(
    filters: StockMovementFiltersDTO,
    companyId: string,
  ): Promise<{ items: StockMovementResponseDTO[]; total: number }> {
    const where: Prisma.StockMovementWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.locationId) {
      where.fromLocationId = filters.locationId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.reference) {
      where.reference = {
        contains: filters.reference,
        mode: 'insensitive',
      };
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {
        ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
      };
    }

    const orderBy: Prisma.StockMovementOrderByWithRelationInput = (() => {
      const sortOrder = filters.sortOrder;
      switch (filters.sortBy) {
        case 'quantity':
          return { quantity: sortOrder };
        case 'unitCost':
          return { unitCost: sortOrder };
        case 'type':
          return { type: sortOrder };
        case 'createdAt':
          return { createdAt: sortOrder };
        default:
          return { createdAt: 'desc' };
      }
    })();

    const [items, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: {
          product: {
            select: {
              name: true,
              sku: true,
            },
          },
          fromLocation: {
            select: {
              name: true,
            },
          },
          toLocation: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return {
      items: items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name || null,
        productCode: item.product?.sku || null,
        type: item.type as 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER',
        quantity: item.quantity.toNumber(),
        unitCost: item.unitCost?.toNumber() || null,
        totalCost: item.totalCost?.toNumber() || null,
        reason: item.reason,
        reference: item.reference,
        locationId: item.fromLocationId,
        locationName: item.fromLocation?.name || null,
        destinationLocationId: item.toLocationId,
        destinationLocationName: item.toLocation?.name || null,
        notes: item.notes,
        userId: item.userId,
        userName: item.user.name,
        createdAt: item.createdAt.toISOString(),
        batchNumber: null, // Add missing properties
        expirationDate: null, // Add missing properties
      })),
      total,
    };
  }

  async createReservation(
    data: StockReservationDTO,
    userId: string,
    companyId: string,
  ): Promise<StockReservationResponseDTO> {
    const createData: Prisma.StockReservationUncheckedCreateInput = {
      userId,
      companyId,
      status: 'ACTIVE',
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      productId: data.productId ?? null,
      quantity: new Prisma.Decimal(data.quantity),
      notes: data.reason ?? null,
      locationId: data.locationId!,
    };

    if (data.referenceType === 'ORDER' && data.referenceId) {
      createData.orderId = data.referenceId;
    }
    if (data.referenceType === 'QUOTE' && data.referenceId) {
      createData.quoteId = data.referenceId;
    }

    const reservation = await this.prisma.stockReservation.create({
      data: createData,
      include: {
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
        location: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const productRel = (reservation as any).product;
    const locationRel = (reservation as any).location;
    const userRel = (reservation as any).user;
    if (!productRel || !locationRel || !userRel) throw new Error('Product, Location, or User not found');

    return {
      id: reservation.id,
      productId: reservation.productId,
      productName: productRel.name,
      productCode: productRel.sku,
      quantity: reservation.quantity.toNumber(),
      status: reservation.status as 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'FULFILLED',
      expiresAt: reservation.expiresAt?.toISOString() || null,
      locationId: reservation.locationId,
      locationName: locationRel.name,
      notes: reservation.notes,
      userId: reservation.userId,
      userName: userRel.name,
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
      reason: reservation.notes, // Map notes back to reason
      referenceId: reservation.orderId || reservation.quoteId || null,
      referenceType: reservation.orderId ? 'ORDER' : reservation.quoteId ? 'QUOTE' : 'OTHER',
    };
  }

  async updateReservedQuantity(
    productId: string,
    locationId: string,
    quantityChange: number,
    companyId: string,
  ): Promise<void> {
    const stockItem = await this.prisma.stockItem.findFirst({
      where: {
        productId,
        locationId,
        companyId,
        deletedAt: null,
      },
    });

    if (stockItem) {
      await this.prisma.stockItem.update({
        where: { id: stockItem.id },
        data: {
          reservedQuantity: stockItem.reservedQuantity.add(quantityChange),
        },
      });
    }
  }

  async findReservationById(
    id: string,
    companyId: string,
  ): Promise<StockReservationResponseDTO | null> {
    const reservation = await this.prisma.stockReservation.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
        location: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const productRel = (reservation as any)?.product;
    const locationRel = (reservation as any)?.location;
    const userRel = (reservation as any)?.user;
    if (!reservation || !productRel || !locationRel || !userRel) return null;

    return {
      id: reservation.id,
      productId: reservation.productId,
      productName: productRel.name,
      productCode: productRel.sku,
      quantity: reservation.quantity.toNumber(),
      status: reservation.status as 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'FULFILLED',
      expiresAt: reservation.expiresAt?.toISOString() || null,
      locationId: reservation.locationId,
      locationName: locationRel.name,
      notes: reservation.notes,
      userId: reservation.userId,
      userName: userRel.name,
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
      reason: reservation.notes, // Map notes back to reason
      referenceId: reservation.orderId || reservation.quoteId || null,
      referenceType: reservation.orderId ? 'ORDER' : reservation.quoteId ? 'QUOTE' : 'OTHER',
    };
  }

  async cancelReservation(id: string, data: CancelStockReservationDTO, companyId: string): Promise<void> {
    await this.prisma.stockReservation.update({
      where: {
        id,
        companyId,
      },
      data: {
        status: 'CANCELLED',
        notes: data.notes || null,
        updatedAt: new Date(),
      },
    });
  }

  async findReservations(
    filters: StockReservationFiltersDTO,
    companyId: string,
  ): Promise<{ items: StockReservationResponseDTO[]; total: number }> {
    const where: Prisma.StockReservationWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.locationId) {
      where.locationId = filters.locationId;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {
        ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
      };
    }

    const orderBy: Prisma.StockReservationOrderByWithRelationInput = (() => {
      const sortOrder = filters.sortOrder;
      switch (filters.sortBy) {
        case 'quantity':
          return { quantity: sortOrder };
        case 'expiresAt':
          return { expiresAt: sortOrder };
        case 'createdAt':
          return { createdAt: sortOrder };
        default:
          return { createdAt: 'desc' };
      }
    })();

    const [items, total] = await Promise.all([
      this.prisma.stockReservation.findMany({
        where,
        include: {
          product: {
            select: {
              name: true,
              sku: true,
            },
          },
          location: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.stockReservation.count({ where }),
    ]);

    return {
      items: items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productCode: item.product.sku,
        quantity: item.quantity.toNumber(),
        status: item.status as 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'FULFILLED',
        expiresAt: item.expiresAt?.toISOString() || null,
        locationId: item.locationId,
        locationName: item.location?.name || null,
        notes: item.notes,
        userId: item.userId,
        userName: item.user.name,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        reason: item.notes, // Map notes back to reason
        referenceId: item.orderId || item.quoteId || null,
        referenceType: item.orderId ? 'ORDER' : item.quoteId ? 'QUOTE' : 'OTHER',
      })),
      total,
    };
  }

  async createLocation(
    data: CreateStockLocationDTO,
    companyId: string,
  ): Promise<StockLocationResponseDTO> {
    const location = await this.prisma.stockLocation.create({
      data: {
        name: data.name,
        code: data.code ?? null,
        type: data.type as any,
        isActive: data.isActive ?? true,
        description: data.description ?? null,
        address: data.address ?? null,
        companyId,
      },
    });

    return {
      id: location.id,
      name: location.name,
      code: location.code,
      description: location.description,
      type: location.type as 'WAREHOUSE' | 'STORE' | 'VIRTUAL',
      address: location.address,
      isActive: location.isActive,
      totalProducts: 0,
      totalValue: 0,
      createdAt: location.createdAt.toISOString(),
      updatedAt: location.updatedAt.toISOString(),
    };
  }

  async findLocationById(id: string, companyId: string): Promise<StockLocationResponseDTO | null> {
    const location = await this.prisma.stockLocation.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            stockItems: true,
          },
        },
        stockItems: {
          where: {
            deletedAt: null,
          },
          select: {
            quantity: true,
            unitCost: true,
          },
        },
      },
    });

    if (!location) return null;

    const stockItemsList = (location as any).stockItems as Array<{ quantity: Prisma.Decimal; unitCost: Prisma.Decimal }>;
    const totalValue = stockItemsList.reduce(
      (sum: number, item: { quantity: Prisma.Decimal; unitCost: Prisma.Decimal }) =>
        sum + item.quantity.mul(item.unitCost).toNumber(),
      0,
    );

    return {
      id: location.id,
      name: location.name,
      code: location.code,
      description: location.description,
      type: location.type as 'WAREHOUSE' | 'STORE' | 'VIRTUAL',
      address: location.address,
      isActive: location.isActive,
      totalProducts: (location as any)._count?.stockItems ?? stockItemsList.length,
      totalValue,
      createdAt: location.createdAt.toISOString(),
      updatedAt: location.updatedAt.toISOString(),
    };
  }

  async updateLocation(
    id: string,
    data: UpdateStockLocationDTO,
    companyId: string,
  ): Promise<StockLocationResponseDTO> {
    const updateData: Prisma.StockLocationUpdateInput = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code ?? null;
    if (data.description !== undefined) updateData.description = data.description ?? null;
    if (data.type !== undefined) updateData.type = data.type as any;
    if (data.address !== undefined) updateData.address = data.address ?? null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const location = await this.prisma.stockLocation.update({
      where: {
        id,
        companyId,
      },
      data: updateData,
      include: {
        _count: {
          select: {
            stockItems: true,
          },
        },
        stockItems: {
          where: {
            deletedAt: null,
          },
          select: {
            quantity: true,
            unitCost: true,
          },
        },
      },
    });

    const stockItemsList = (location as any).stockItems as Array<{ quantity: Prisma.Decimal; unitCost: Prisma.Decimal }>;
    const totalValue = stockItemsList.reduce(
      (sum: number, item: { quantity: Prisma.Decimal; unitCost: Prisma.Decimal }) =>
        sum + item.quantity.mul(item.unitCost).toNumber(),
      0,
    );

    return {
      id: location.id,
      name: location.name,
      code: location.code,
      description: location.description,
      type: location.type as 'WAREHOUSE' | 'STORE' | 'VIRTUAL',
      address: location.address,
      isActive: location.isActive,
      totalProducts: (location as any)._count?.stockItems ?? stockItemsList.length,
      totalValue,
      createdAt: location.createdAt.toISOString(),
      updatedAt: location.updatedAt.toISOString(),
    };
  }

  async deleteLocation(id: string, companyId: string): Promise<void> {
    await this.prisma.stockLocation.update({
      where: {
        id,
        companyId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getStats(companyId: string): Promise<StockStatsDTO> {
    const [stockItems, movements, reservations] = await Promise.all([
      this.prisma.stockItem.findMany({
        where: {
          companyId,
          deletedAt: null,
        },
        include: {
          product: {
            select: {
              name: true,
            },
          },
          location: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.prisma.stockMovement.count({
        where: {
          companyId,
          deletedAt: null,
        },
      }),
      this.prisma.stockReservation.count({
        where: {
          companyId,
          status: 'ACTIVE',
          deletedAt: null,
        },
      }),
    ]);

    const totalProducts = stockItems.length;
    const totalValue = stockItems.reduce(
      (sum: number, item: { quantity: Prisma.Decimal; unitCost: Prisma.Decimal }) =>
        sum + item.quantity.mul(item.unitCost).toNumber(),
      0,
    );
    const lowStockProducts = stockItems.filter((item) => item.quantity.lte(item.minStock)).length;
    const outOfStockProducts = stockItems.filter((item) => item.quantity.lte(0)).length;

    const topProducts = stockItems
      .map((item: any) => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity.toNumber(),
        value: item.quantity.mul(item.unitCost).toNumber(),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

      const valueByLocation = stockItems.reduce<Record<string, {
        locationId: string | null;
        locationName: string | null;
        totalValue: number;
        totalProducts: number;
      }>>((acc, item) => {
        const locationId = item.locationId;
        const locationName = item.location?.name || null;
        const key = locationId || 'null';
        
        if (!acc[key]) {
          acc[key] = {
            locationId,
            locationName,
            totalValue: 0,
            totalProducts: 0
          };
        }
        
        acc[key].totalValue += item.quantity.mul(item.unitCost).toNumber();
        acc[key].totalProducts += 1;
        
        return acc;
      }, {} as Record<string, { locationId: string | null; locationName: string | null; totalValue: number; totalProducts: number }>);
  
      return {
        totalProducts,
        totalValue,
        lowStockProducts,
        outOfStockProducts,
        totalMovements: movements,
        totalReservations: reservations,
        expiredBatches: 0, // TODO: Implementar contagem de lotes vencidos
        topProducts,
        movementsByType: [], // TODO: Implementar agrupamento por tipo
        valueByLocation: Object.values(valueByLocation)
      };
  }

  async findForReport(companyId: string): Promise<StockReportDTO[]> {
    const stockItems = await this.prisma.stockItem.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
            category: true,
          },
        },
        location: {
          select: {
            name: true,
          },
        },
        batches: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    return stockItems.map((item: any) => ({
      productId: item.productId,
      productName: item.product.name,
      productCode: item.product.sku,
      productCategory: item.product.category || '',
      locationName: item.location?.name || null,
      quantity: item.quantity.toNumber(),
      reservedQuantity: item.reservedQuantity.toNumber(),
      availableQuantity: item.quantity.minus(item.reservedQuantity).toNumber(),
      unitCost: item.unitCost.toNumber(),
      totalValue: item.quantity.mul(item.unitCost).toNumber(),
      minStock: item.minStock,
      maxStock: item.maxStock,
      isLowStock: item.quantity.lte(item.minStock),
      isOutOfStock: item.quantity.lte(0),
      lastMovementAt: item.lastMovementAt?.toISOString() || null,
      lastMovementType: item.lastMovementType,
      batchesCount: item.batches.length,
      expiredBatchesCount: item.batches.filter(
        (batch: any) => batch.expirationDate && batch.expirationDate < new Date(),
      ).length,
    }));
  }

  async findMovementsForReport(
    companyId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<StockMovementReportDTO[]> {
    const where: Prisma.StockMovementWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    const movements = await this.prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
        fromLocation: {
          select: {
            name: true,
          },
        },
        toLocation: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return movements.map((movement: any) => ({
      date: movement.createdAt.toISOString().split('T')[0],
      productName: movement.product.name,
      productCode: movement.product.sku,
      type: movement.type,
      quantity: movement.quantity.toNumber(),
      unitCost: movement.unitCost?.toNumber() || null,
      totalCost: movement.totalCost?.toNumber() || null,
      reason: movement.reason,
      reference: movement.reference,
      locationName: movement.fromLocation?.name || null,
      destinationLocationName: movement.toLocation?.name || null,
      userName: movement.user.name,
    }));
  }
}