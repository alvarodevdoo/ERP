import { PrismaClient, Product, Prisma } from '@prisma/client';

interface ProductWithRelations extends Product {
  barcode: string | null;
  unitOfMeasure: string;
  maxStock: Prisma.Decimal | null;
  images: string[];
  tags: string[];
  isService: boolean;
  hasVariations: boolean;
}
import {
  CreateProductDto,
  UpdateProductDto,
  ProductFiltersDto,
  ProductResponseDto,
  ProductListResponseDto,
  ProductStatsDto,
  ProductCategoryResponseDto
} from '../dtos';
import {
  ProductRepository,
  ProductCategoryRepository,
  StockMovementRepository
} from '../repositories';
// import { RoleService } from '../../auth/services/role.service'; // TODO: Implementar validação de permissões
import { AppError } from '../../../shared/errors/AppError';

/**
 * Service para gerenciamento de produtos
 * Implementa regras de negócio e validações
 */
export class ProductService {
  private productRepository: ProductRepository;
  private categoryRepository: ProductCategoryRepository;
  private stockMovementRepository: StockMovementRepository;
  // private roleService: RoleService; // TODO: Implementar validação de permissões

  constructor(private prisma: PrismaClient) {
    this.productRepository = new ProductRepository(prisma);
    this.categoryRepository = new ProductCategoryRepository(prisma);
    this.stockMovementRepository = new StockMovementRepository(prisma);
    // this.roleService = new RoleService(prisma); // TODO: Implementar validação de permissões
  }

  /**
   * Criar novo produto
   */
  async create(
    data: CreateProductDto,
    companyId: string,
    userId: string
  ): Promise<ProductResponseDto> {
    // Validar permissões
    await this.validatePermission(userId, companyId, 'products', 'create');

    // Validar dados do produto
    await this.validateProductData(data, companyId);

    // Verificar se SKU já existe
    const skuExists = await this.productRepository.skuExists(data.sku, companyId);
    if (skuExists) {
      throw new AppError('SKU já existe para esta empresa', 409);
    }

    // Validar categoria se fornecida
    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId, companyId);
      if (!category) {
        throw new AppError('Categoria não encontrada', 404);
      }
      if (!category.isActive) {
        throw new AppError('Categoria está inativa', 400);
      }
    }

    // Calcular preços se não fornecidos
    const productData = this.calculatePrices(data);

    const product = await this.productRepository.create(productData as CreateProductDto, companyId);

    // Criar movimentação inicial de estoque se quantidade inicial > 0
    if (data.initialStock && data.initialStock > 0) {
      await this.stockMovementRepository.create(
        {
          productId: product.id,
          type: 'IN',
          quantity: data.initialStock,
          unitCost: data.costPrice || 0,
          reason: 'Estoque inicial',
          reference: `INICIAL-${product.sku}`
        },
        companyId,
        userId
      );

      // Atualizar estoque do produto
      await this.productRepository.updateStock(product.id, data.initialStock, companyId);
    }

    return product;
  }

  /**
   * Buscar produto por ID
   */
  async findById(
    id: string,
    companyId: string,
    userId: string
  ): Promise<ProductResponseDto | null> {
    await this.validatePermission(userId, companyId, 'products', 'read');

    const product = await this.productRepository.findById(id, companyId);
    return product ? product : null;
  }

  /**
   * Buscar produtos com filtros
   */
  async findMany(
    filters: ProductFiltersDto,
    companyId: string,
    userId: string
  ): Promise<ProductListResponseDto> {
    await this.validatePermission(userId, companyId, 'products', 'read');

    const result = await this.productRepository.findMany(filters, companyId);
    return result;
  }

  /**
   * Atualizar produto
   */
  async update(
    id: string,
    data: UpdateProductDto,
    companyId: string,
    userId: string
  ): Promise<ProductResponseDto> {
    await this.validatePermission(userId, companyId, 'products', 'update');

    // Verificar se produto existe
    const existingProduct = await this.productRepository.findById(id, companyId);
    if (!existingProduct) {
      throw new AppError('Produto não encontrado', 404);
    }

    // Validar dados do produto
    await this.validateProductData(data, companyId, id);

    // Verificar se SKU já existe (excluindo o produto atual)
    if (data.sku && data.sku !== existingProduct.sku) {
      const skuExists = await this.productRepository.skuExists(data.sku, companyId, id);
      if (skuExists) {
        throw new AppError('SKU já existe para esta empresa', 409);
      }
    }

    // Validar categoria se fornecida
    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId, companyId);
      if (!category) {
        throw new AppError('Categoria não encontrada', 404);
      }
      if (!category.isActive) {
        throw new AppError('Categoria está inativa', 400);
      }
    }

    // Calcular preços se alterados
    const productData = this.calculatePrices(data);

    const product = await this.productRepository.update(id, productData, companyId);
    return product;
  }

  /**
   * Deletar produto (soft delete)
   */
  async delete(
    id: string,
    companyId: string,
    userId: string
  ): Promise<void> {
    await this.validatePermission(userId, companyId, 'products', 'delete');

    // Verificar se produto pode ser deletado
    const canDelete = await this.canDeleteProduct(id, companyId);
    if (!canDelete.canDelete) {
      throw new AppError(canDelete.reason!, 400);
    }

    await this.productRepository.delete(id, companyId);
  }

  /**
   * Restaurar produto
   */
  async restore(
    id: string,
    companyId: string,
    userId: string
  ): Promise<ProductResponseDto> {
    await this.validatePermission(userId, companyId, 'products', 'update');

    const product = await this.productRepository.restore(id, companyId);
    return product;
  }

  /**
   * Buscar produtos por categoria
   */
  async findByCategory(
    categoryId: string,
    companyId: string,
    userId: string,
    includeInactive = false
  ): Promise<ProductResponseDto[]> {
    await this.validatePermission(userId, companyId, 'products', 'read');

    const products = await this.productRepository.findByCategory(
      categoryId,
      companyId
    );

    return products;
  }

  /**
   * Buscar produtos com estoque baixo
   */
  async findLowStock(
    companyId: string,
    userId: string
  ): Promise<ProductResponseDto[]> {
    await this.validatePermission(userId, companyId, 'products', 'read');

    const products = await this.productRepository.findLowStock(companyId);
    return products;
  }

  /**
   * Buscar produtos sem estoque
   */
  async findOutOfStock(
    companyId: string,
    userId: string
  ): Promise<ProductResponseDto[]> {
    await this.validatePermission(userId, companyId, 'products', 'read');

    const products = await this.productRepository.findOutOfStock(companyId);
    return products;
  }

  /**
   * Obter estatísticas de produtos
   */
  async getStats(
    companyId: string,
    userId: string
  ): Promise<ProductStatsDto> {
    await this.validatePermission(userId, companyId, 'products', 'read');

    return await this.productRepository.getStats(companyId);
  }

  /**
   * Atualizar estoque do produto
   */
  async updateStock(
    id: string,
    quantity: number,
    companyId: string,
    userId: string,
    reason?: string,
    reference?: string
  ): Promise<ProductResponseDto> {
    await this.validatePermission(userId, companyId, 'products', 'update');

    // Verificar se produto existe
    const product = await this.productRepository.findById(id, companyId);
    if (!product) {
      throw new AppError('Produto não encontrado', 404);
    }

    if (!product.trackStock) {
      throw new AppError('Produto não controla estoque', 400);
    }

    // Criar movimentação de estoque
    const movementType = quantity > 0 ? 'IN' : 'OUT';
    const movementQuantity = Math.abs(quantity);

    await this.stockMovementRepository.create(
      {
        productId: id,
        type: movementType,
        quantity: movementQuantity,
        unitCost: product.costPrice || 0,
        reason: reason || `${movementType === 'IN' ? 'Entrada' : 'Saída'} manual`,
        reference: reference || `MANUAL-${Date.now()}`
      },
      companyId,
      userId
    );

    // Atualizar estoque do produto
    const newStock = Math.max(0, product.currentStock + quantity);
    await this.productRepository.updateStock(id, newStock, companyId);
    const refreshed = await this.productRepository.findById(id, companyId);
    if (!refreshed) {
      throw new AppError('Produto não encontrado após atualização de estoque', 404);
    }
    return refreshed;
  }

  /**
   * Ajustar estoque do produto
   */
  async adjustStock(
    id: string,
    newQuantity: number,
    companyId: string,
    userId: string,
    reason?: string
  ): Promise<ProductResponseDto> {
    await this.validatePermission(userId, companyId, 'products', 'update');

    // Verificar se produto existe
    const product = await this.productRepository.findById(id, companyId);
    if (!product) {
      throw new AppError('Produto não encontrado', 404);
    }

    if (!product.trackStock) {
      throw new AppError('Produto não controla estoque', 400);
    }

    const currentStock = product.currentStock;
    const adjustment = newQuantity - currentStock;

    if (adjustment !== 0) {
      // Criar movimentação de ajuste
      await this.stockMovementRepository.create(
        {
          productId: id,
          type: 'ADJUSTMENT',
          quantity: adjustment,
          unitCost: product.costPrice || 0,
          reason: reason || 'Ajuste de estoque',
          reference: `AJUSTE-${Date.now()}`
        },
        companyId,
        userId
      );

      // Atualizar estoque do produto
      await this.productRepository.updateStock(id, newQuantity, companyId);
      const refreshed = await this.productRepository.findById(id, companyId);
      if (!refreshed) {
        throw new AppError('Produto não encontrado após ajuste de estoque', 404);
      }
      return refreshed;
    }

    return product;
  }

  /**
   * Verificar disponibilidade de SKU
   */
  async checkSkuAvailability(
    sku: string,
    companyId: string,
    excludeId?: string
  ): Promise<{ available: boolean }> {
    const exists = await this.productRepository.skuExists(sku, companyId, excludeId);
    return { available: !exists };
  }

  /**
   * Buscar produtos para relatório
   */
  async findForReport(
    filters: ProductFiltersDto,
    companyId: string,
    userId: string
  ): Promise<ProductResponseDto[]> {
    await this.validatePermission(userId, companyId, 'products', 'read');

    return await this.productRepository.findForReport(filters, companyId);
  }

  /**
   * Validar dados do produto
   */
  private async validateProductData(
    data: CreateProductDto | UpdateProductDto,
    _companyId: string,
    _excludeId?: string
  ): Promise<void> {
    // Validar SKU
    if (data.sku) {
      if (data.sku.length < 2) {
        throw new AppError('SKU deve ter pelo menos 2 caracteres', 400);
      }
      if (!/^[A-Z0-9-_]+$/i.test(data.sku)) {
        throw new AppError('SKU deve conter apenas letras, números, hífens e underscores', 400);
      }
    }

    // Validar preços
    if (data.costPrice !== undefined && data.costPrice < 0) {
      throw new AppError('Preço de custo não pode ser negativo', 400);
    }
    if (data.salePrice !== undefined && data.salePrice < 0) {
      throw new AppError('Preço de venda não pode ser negativo', 400);
    }
    if (data.wholesalePrice !== undefined && data.wholesalePrice < 0) {
      throw new AppError('Preço atacado não pode ser negativo', 400);
    }

    // Validar estoque
    if (data.minStock !== undefined && data.minStock < 0) {
      throw new AppError('Estoque mínimo não pode ser negativo', 400);
    }
    if (data.maxStock !== undefined && data.maxStock < 0) {
      throw new AppError('Estoque máximo não pode ser negativo', 400);
    }
    if (data.minStock !== undefined && data.maxStock !== undefined && data.minStock > data.maxStock) {
      throw new AppError('Estoque mínimo não pode ser maior que o máximo', 400);
    }

    // Validar dimensões
    if (data.weight !== undefined && data.weight < 0) {
      throw new AppError('Peso não pode ser negativo', 400);
    }
    if (data.dimensions?.length !== undefined && data.dimensions.length < 0) {
      throw new AppError('Comprimento não pode ser negativo', 400);
    }
    if (data.dimensions?.width !== undefined && data.dimensions.width < 0) {
      throw new AppError('Largura não pode ser negativa', 400);
    }
    if (data.dimensions?.height !== undefined && data.dimensions.height < 0) {
      throw new AppError('Altura não pode ser negativa', 400);
    }
  }

  /**
   * Calcular preços baseados em margens
   */
  private calculatePrices(data: CreateProductDto | UpdateProductDto): CreateProductDto | UpdateProductDto {
    const result = { ...data };

    // Se tem preço de custo e margem, calcular preço de venda
    if (result.costPrice && result.profitMargin && !result.salePrice) {
      result.salePrice = result.costPrice * (1 + result.profitMargin / 100);
    }

    // Se tem preço de venda e preço de custo, calcular margem
    if (result.salePrice && result.costPrice && !result.profitMargin) {
      result.profitMargin = ((result.salePrice - result.costPrice) / result.costPrice) * 100;
    }

    return result;
  }

  /**
   * Verificar se produto pode ser deletado
   */
  private async canDeleteProduct(
    productId: string,
    companyId: string
  ): Promise<{ canDelete: boolean; reason?: string }> {
    try {
      // Verificar se produto tem movimentações de estoque
      const movementCount = await this.prisma.stockMovement.count({
        where: {
          productId,
          companyId
        }
      });

      if (movementCount > 0) {
        return {
          canDelete: false,
          reason: 'Produto possui movimentações de estoque'
        };
      }

      // Verificar se produto está em orçamentos
      const quoteItemCount = await this.prisma.quoteItem.count({
        where: {
          productId,
          quote: {
            companyId
          }
        }
      });

      if (quoteItemCount > 0) {
        return {
          canDelete: false,
          reason: 'Produto está sendo usado em orçamentos'
        };
      }

      // Verificar se produto está em ordens de serviço
      const orderItemCount = await this.prisma.orderItem.count({
        where: {
          productId,
          order: {
            companyId
          }
        }
      });

      if (orderItemCount > 0) {
        return {
          canDelete: false,
          reason: 'Produto está sendo usado em ordens de serviço'
        };
      }

      return { canDelete: true };
    } catch {
      throw new AppError('Erro ao verificar se produto pode ser deletado', 500);
    }
  }

  /**
   * Validar permissões do usuário
   * TODO: Implementar validação de permissões quando RoleService estiver disponível
   */
  private async validatePermission(
    _userId: string,
    _companyId: string,
    _resource: string,
    _action: string
  ): Promise<void> {
    // TODO: Implementar validação de permissões
    // const hasPermission = await this.roleService.checkPermission(
    //   userId,
    //   companyId,
    //   resource,
    //   action
    // );

    // if (!hasPermission) {
    //   throw new AppError('Usuário não tem permissão para esta ação', 403);
    // }
  }

  /**
   * Formatar resposta do produto
   */
  // 
  private formatProductResponse(product: ProductWithRelations & { category?: ProductCategoryResponseDto }): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      barcode: product.barcode || null,
      categoryId: product.categoryId ?? null,
      category: product.category,
      unitOfMeasure: product.unitOfMeasure,
      unit: product.unitOfMeasure,
      costPrice: product.costPrice.toNumber(),
      salePrice: product.salePrice.toNumber(),
      wholesalePrice: product.wholesalePrice?.toNumber() || null,
      profitMargin: product.profitMargin?.toNumber() || null,
      trackStock: product.trackStock,
      currentStock: product.currentStock,
      minStock: product.minStock,
      maxStock: product.maxStock?.toNumber() || null,
      weight: product.weight?.toNumber() || null,
      length: product.length?.toNumber() || null,
      width: product.width?.toNumber() || null,
      height: product.height?.toNumber() || null,
      images: product.images || [],
      isActive: product.isActive,
      isService: product.isService,
      hasVariations: product.hasVariations,
      tags: product.tags || [],
      companyId: product.companyId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt
    };
  }
}