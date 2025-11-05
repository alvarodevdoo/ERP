import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../shared/errors/AppError';
import { RoleService } from '../../role/services/role.service';
import { StockRepository } from '../repositories';
import {
  StockMovementDTO,
  StockAdjustmentDTO,
  StockTransferDTO,
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
  StockDashboardDTO
} from '../dtos';
import { RoleRepository } from '../../role/repositories/role.repository';

export class StockService {
  private stockRepository: StockRepository;
  private roleService: RoleService;

  constructor(
    private prisma: PrismaClient,
    roleService?: RoleService
  ) {
    this.stockRepository = new StockRepository(prisma);
    this.roleService = roleService || new RoleService(new RoleRepository(prisma));
  }

  
  async stockIn(data: StockMovementDTO, userId: string, companyId: string): Promise<StockMovementResponseDTO> {
    const hasPermission = await this.roleService.checkPermission({ userId, permission: 'write', resource: 'stock' });
    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para registrar entrada de estoque', 403);
    }

    if (data.type !== 'IN') {
      throw new AppError('Tipo de movimentação deve ser IN para entrada de estoque', 400);
    }

    if (data.quantity <= 0) {
      throw new AppError('Quantidade deve ser maior que zero', 400);
    }

    if (data.unitCost && data.unitCost < 0) {
      throw new AppError('Custo unitário não pode ser negativo', 400);
    }

    const product = await this.prisma.product.findFirst({
      where: {
        id: data.productId,
        companyId,
      }
    });

    if (!product) {
      throw new AppError('Produto não encontrado', 404);
    }

    try {
      return await this.prisma.$transaction(async () => {
        const movement = await this.stockRepository.createMovement(data, userId, companyId);
        await this.stockRepository.updateStockQuantity(
          data.productId,
          data.locationId!,
          data.quantity,
          data.unitCost,
          companyId
        );
        return movement;
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao registrar entrada de estoque', 500);
    }
  }

  
  async stockOut(data: StockMovementDTO, userId: string, companyId: string): Promise<StockMovementResponseDTO> {
    const hasPermission = await this.roleService.checkPermission({ userId, permission: 'write', resource: 'stock' });
    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para registrar saída de estoque', 403);
    }

    if (data.type !== 'OUT') {
      throw new AppError('Tipo de movimentação deve ser OUT para saída de estoque', 400);
    }

    if (data.quantity <= 0) {
      throw new AppError('Quantidade deve ser maior que zero', 400);
    }

    const stockItem = await this.stockRepository.findStockItem(
      data.productId,
      data.locationId!,
      companyId
    );

    if (!stockItem) {
      throw new AppError('Produto não encontrado no estoque', 404);
    }

    if (stockItem.availableQuantity < data.quantity) {
      throw new AppError(
        `Quantidade insuficiente em estoque. Disponível: ${stockItem.availableQuantity}`,
        400
      );
    }

    try {
      return await this.prisma.$transaction(async () => {
        const movement = await this.stockRepository.createMovement(data, userId, companyId);
        await this.stockRepository.updateStockQuantity(
          data.productId,
          data.locationId!,
          -data.quantity,
          undefined,
          companyId
        );
        return movement;
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao registrar saída de estoque', 500);
    }
  }

  
  async adjustStock(data: StockAdjustmentDTO, userId: string, companyId: string): Promise<StockMovementResponseDTO> {
    const hasPermission = await this.roleService.checkPermission({ userId, permission: 'adjust', resource: 'stock' });
    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para ajustar estoque', 403);
    }

    if (data.newQuantity < 0) {
      throw new AppError('Nova quantidade não pode ser negativa', 400);
    }

    const currentStock = await this.stockRepository.findStockItem(
      data.productId,
      data.locationId!,
      companyId
    );

    const currentQuantity = currentStock?.quantity || 0;
    const quantityDifference = data.newQuantity - currentQuantity;

    if (quantityDifference === 0) {
      throw new AppError('Nova quantidade é igual à quantidade atual', 400);
    }

    const movementData: StockMovementDTO = {
      productId: data.productId,
      type: 'ADJUSTMENT',
      quantity: Math.abs(quantityDifference),
      reason: data.reason,
      locationId: data.locationId,
      notes: data.notes
    };

    try {
      return await this.prisma.$transaction(async () => {
        const movement = await this.stockRepository.createMovement(movementData, userId, companyId);
        await this.stockRepository.updateStockQuantity(
          data.productId,
          data.locationId!,
          quantityDifference,
          undefined,
          companyId
        );
        return movement;
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao ajustar estoque', 500);
    }
  }

  
  async transferStock(data: StockTransferDTO, userId: string, companyId: string): Promise<StockMovementResponseDTO> {
    const hasPermission = await this.roleService.checkPermission({ userId, permission: 'transfer', resource: 'stock' });
    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para transferir estoque', 403);
    }

    if (data.fromLocationId === data.toLocationId) {
      throw new AppError('Localização de origem e destino não podem ser iguais', 400);
    }

    if (data.quantity <= 0) {
      throw new AppError('Quantidade deve ser maior que zero', 400);
    }

    const sourceStock = await this.stockRepository.findStockItem(
      data.productId,
      data.fromLocationId,
      companyId
    );

    if (!sourceStock) {
      throw new AppError('Produto não encontrado na localização de origem', 404);
    }

    if (sourceStock.availableQuantity < data.quantity) {
      throw new AppError(
        `Quantidade insuficiente na localização de origem. Disponível: ${sourceStock.availableQuantity}`,
        400
      );
    }

    const movementData: StockMovementDTO = {
      productId: data.productId,
      type: 'TRANSFER',
      quantity: data.quantity,
      reason: data.reason,
      locationId: data.fromLocationId,
      destinationLocationId: data.toLocationId,
      notes: data.notes
    };

    try {
      return await this.prisma.$transaction(async () => {
        const movement = await this.stockRepository.createMovement(movementData, userId, companyId);
        await this.stockRepository.updateStockQuantity(
          data.productId,
          data.fromLocationId,
          -data.quantity,
          undefined,
          companyId
        );
        await this.stockRepository.updateStockQuantity(
          data.productId,
          data.toLocationId,
          data.quantity,
          sourceStock.unitCost,
          companyId
        );
        return movement;
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao transferir estoque', 500);
    }
  }

  
  async findMany(filters: StockFiltersDTO, userId: string, companyId: string): Promise<{ items: StockItemResponseDTO[]; total: number }> {
    const hasPermission = await this.roleService.checkPermission({ userId, permission: 'read', resource: 'stock' });
    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para visualizar estoque', 403);
    }
    return this.stockRepository.findMany(filters, companyId);
  }

  
  async findStockItem(productId: string, locationId: string, userId: string, companyId: string): Promise<StockItemResponseDTO | null> {
    const hasPermission = await this.roleService.checkPermission({ userId, permission: 'read', resource: 'stock' });
    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para visualizar estoque', 403);
    }
    return this.stockRepository.findStockItem(productId, locationId, companyId);
  }

  
  async findMovements(filters: StockMovementFiltersDTO, userId: string, companyId: string): Promise<{ items: StockMovementResponseDTO[]; total: number }> {
    const hasPermission = await this.roleService.checkPermission({ userId, permission: 'read', resource: 'stock' });
    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para visualizar movimentações de estoque', 403);
    }
    return this.stockRepository.findMovements(filters, companyId);
  }

  
  async createReservation(data: StockReservationDTO, userId: string, companyId: string): Promise<StockReservationResponseDTO> {
    const hasPermission = await this.roleService.checkPermission({ userId, permission: 'reserve', resource: 'stock' });
    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para reservar estoque', 403);
    }

    const stockItem = await this.stockRepository.findStockItem(
      data.productId,
      data.locationId!,
      companyId
    );

    if (!stockItem) {
      throw new AppError('Produto não encontrado no estoque', 404);
    }

    if (stockItem.availableQuantity < data.quantity) {
      throw new AppError(
        `Quantidade insuficiente para reserva. Disponível: ${stockItem.availableQuantity}`,
        400
      );
    }

    try {
      return await this.prisma.$transaction(async () => {
        const reservation = await this.stockRepository.createReservation(data, userId, companyId);
        await this.stockRepository.updateReservedQuantity(
          data.productId,
          data.locationId!,
          data.quantity,
          companyId
        );
        return reservation;
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao criar reserva de estoque', 500);
    }
  }

  
  async cancelReservation(id: string, data: CancelStockReservationDTO, userId: string, companyId: string): Promise<void> {
    const hasPermission = await this.roleService.checkPermission({ userId, permission: 'reserve', resource: 'stock' });
    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para cancelar reserva de estoque', 403);
    }

    const reservation = await this.stockRepository.findReservationById(id, companyId);
    if (!reservation) {
      throw new AppError('Reserva não encontrada', 404);
    }

    if (reservation.status !== 'ACTIVE') {
      throw new AppError('Apenas reservas ativas podem ser canceladas', 400);
    }

    try {
      await this.prisma.$transaction(async () => {
        await this.stockRepository.cancelReservation(id, data, companyId);
        await this.stockRepository.updateReservedQuantity(
          reservation.productId!,
          reservation.locationId!,
          -reservation.quantity,
          companyId
        );
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao cancelar reserva de estoque', 500);
    }
  }

  
  async findReservations(filters: StockReservationFiltersDTO, userId: string, companyId: string): Promise<{ items: StockReservationResponseDTO[]; total: number }> {
    const hasPermission = await this.roleService.checkPermission({ userId, permission: 'read', resource: 'stock' });
    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para visualizar reservas de estoque', 403);
    }
    return this.stockRepository.findReservations(filters, companyId);
  }

  
  async createLocation(data: CreateStockLocationDTO, userId: string, companyId: string): Promise<StockLocationResponseDTO> {
    const hasPermission = await this.roleService.checkPermission({ userId, permission: 'manage_locations', resource: 'stock' });
    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para gerenciar localizações de estoque', 403);
    }
    return this.stockRepository.createLocation(data, companyId);
  }

  
  async findLocationById(id: string, userId: string, companyId: string): Promise<StockLocationResponseDTO | null> {
    const hasPermission = await this.roleService.checkPermission({ userId, permission: 'read', resource: 'stock' });
    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para visualizar localizações de estoque', 403);
    }
    return this.stockRepository.findLocationById(id, companyId);
  }

  
  async updateLocation(id: string, data: UpdateStockLocationDTO, userId: string, companyId: string): Promise<StockLocationResponseDTO> {
    const hasPermission = await this.roleService.checkPermission({ userId, permission: 'manage_locations', resource: 'stock' });
    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para gerenciar localizações de estoque', 403);
    }
    const existingLocation = await this.stockRepository.findLocationById(id, companyId);
    if (!existingLocation) {
      throw new AppError('Localização não encontrada', 404);
    }
    return this.stockRepository.updateLocation(id, data, companyId);
  }

  
  async deleteLocation(id: string, userId: string, companyId: string): Promise<void> {
    const hasPermission = await this.roleService.checkPermission({ userId, permission: 'manage_locations', resource: 'stock' });
    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para gerenciar localizações de estoque', 403);
    }
    const location = await this.stockRepository.findLocationById(id, companyId);
    if (!location) {
      throw new AppError('Localização não encontrada', 404);
    }
    if (location.totalProducts > 0) {
      throw new AppError('Não é possível excluir localização que possui produtos em estoque', 400);
    }
    await this.stockRepository.deleteLocation(id, companyId);
  }

  
  async getStats(userId: string, companyId: string): Promise<StockStatsDTO> {
    const hasPermission = await this.roleService.checkPermission({ userId, permission: 'read', resource: 'stock' });
    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para visualizar estatísticas de estoque', 403);
    }
    return this.stockRepository.getStats(companyId);
  }

  
  async generateReport(format: 'json' | 'csv', userId: string, companyId: string): Promise<StockReportDTO[] | string> {
    const hasPermission = await this.roleService.checkPermission({ userId, permission: 'report', resource: 'stock' });
    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para gerar relatórios de estoque', 403);
    }
    const data = await this.stockRepository.findForReport(companyId);
    if (format === 'json') {
      return data;
    }
    const headers = [
      'Produto ID', 'Nome do Produto', 'Código', 'Categoria', 'Localização',
      'Quantidade', 'Qtd Reservada', 'Qtd Disponível', 'Custo Unitário', 'Valor Total',
      'Estoque Mínimo', 'Estoque Máximo', 'Estoque Baixo', 'Sem Estoque',
      'Última Movimentação', 'Tipo Última Movimentação', 'Qtd Lotes', 'Lotes Vencidos'
    ];
    const csvRows = [headers.join(',')];
    data.forEach((item: StockReportDTO) => {
      const row = [
        item.productId,
        `"${item.productName}"`, 
        item.productCode,
        `"${item.productCategory}"`, 
        item.locationName ? `"${item.locationName}"` : '', 
        item.quantity,
        item.reservedQuantity,
        item.availableQuantity,
        item.unitCost,
        item.totalValue,
        item.minStock,
        item.maxStock,
        item.isLowStock ? 'Sim' : 'Não',
        item.isOutOfStock ? 'Sim' : 'Não',
        item.lastMovementAt || '',
        item.lastMovementType || '',
        item.batchesCount,
        item.expiredBatchesCount
      ];
      csvRows.push(row.join(','));
    });
    return csvRows.join('\n');
  }

  
  async generateMovementReport(
    format: 'json' | 'csv',
    startDate?: string,
    endDate?: string,
    userId?: string,
    companyId?: string
  ): Promise<StockMovementReportDTO[] | string> {
    const hasPermission = await this.roleService.checkPermission({ userId: userId!, permission: 'report', resource: 'stock' });
    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para gerar relatórios de movimentações', 403);
    }
    const data = await this.stockRepository.findMovementsForReport(companyId!, startDate, endDate);
    if (format === 'json') {
      return data;
    }
    const headers = [
      'Data', 'Nome do Produto', 'Código', 'Tipo', 'Quantidade',
      'Custo Unitário', 'Custo Total', 'Motivo', 'Referência',
      'Localização', 'Destino', 'Usuário'
    ];
    const csvRows = [headers.join(',')];
    data.forEach((item: StockMovementReportDTO) => {
      const row = [
        item.date,
        `"${item.productName}"`, 
        item.productCode,
        item.type,
        item.quantity,
        item.unitCost || '',
        item.totalCost || '',
        `"${item.reason}"`, 
        item.reference ? `"${item.reference}"` : '', 
        item.locationName ? `"${item.locationName}"` : '', 
        item.destinationLocationName ? `"${item.destinationLocationName}"` : '', 
        `"${item.userName}"` 
      ];
      csvRows.push(row.join(','));
    });
    return csvRows.join('\n');
  }

  
  async getDashboard(userId: string, companyId: string): Promise<StockDashboardDTO> {
    const hasPermission = await this.roleService.checkPermission({ userId, permission: 'read', resource: 'stock' });
    if (!hasPermission) {
      throw new AppError('Usuário não tem permissão para visualizar dashboard de estoque', 403);
    }
    const [stats, lowStockItems, recentMovements, activeReservations] = await Promise.all([
      this.stockRepository.getStats(companyId),
      this.stockRepository.findMany(
        { lowStock: true, page: 1, limit: 10, sortBy: 'quantity', sortOrder: 'asc' },
        companyId
      ),
      this.stockRepository.findMovements(
        { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
        companyId
      ),
      this.stockRepository.findReservations(
        { status: 'ACTIVE', page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
        companyId
      )
    ]);
    return {
      stats,
      lowStockAlerts: lowStockItems.items,
      recentMovements: recentMovements.items,
      expiredBatches: [], // TODO: Implementar busca de lotes vencidos
      activeReservations: activeReservations.items,
      topMovingProducts: [] // TODO: Implementar produtos com mais movimentação
    };
  }
}