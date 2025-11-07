import { PrismaClient, Prisma } from '@prisma/client';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductFiltersDto,
  ProductResponseDto,
  ProductListResponseDto,
  ProductStatsDto
} from '../dtos';
import { AppError } from '../../../shared/errors/AppError';

/**
 * Repositório para gerenciamento de produtos
 * Implementa operações CRUD e consultas específicas
 */
export class ProductRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Criar novo produto
   */
  async create(data: CreateProductDto, companyId: string): Promise<ProductResponseDto> {
    try {
      const { variations, dimensions, description, ...productData } = data;
      // Remover propriedades com undefined para respeitar exactOptionalPropertyTypes
      const cleanedProductData = Object.fromEntries(
        Object.entries(productData).filter(([, value]) => value !== undefined)
      ) as Record<string, unknown>;

      const product = await this.prisma.product.create({
        data: {
          ...(cleanedProductData as any),
          description: description ?? null,
          companyId,
          ...(dimensions ? {
            length: dimensions.length ?? null,
            width: dimensions.width ?? null,
            height: dimensions.height ?? null
          } : {}),
          ...(variations ? {
            variants: {
              create: variations.map(variation => ({
                name: variation.name,
                sku: variation.sku,
                costPrice: variation.costPrice,
                salePrice: variation.salePrice,
                currentStock: variation.stock ?? 0,
                // Comentário: remover companyId para satisfazer VariantCreateNestedManyWithoutProductInput.
                // O ID da empresa é herdado via relacionamento de Product.
                attributes: variation.attributes ?? {}
              }))
            }
          } : {})
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          variants: true
        }
      });

      return this.formatProductResponse(product);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AppError('SKU já existe para esta empresa', 409);
        }
      }
      throw new AppError('Erro ao criar produto', 500);
    }
  }

  /**
   * Buscar produto por ID
   */
  async findById(id: string, companyId: string): Promise<ProductResponseDto | null> {
    try {
      const product = await this.prisma.product.findFirst({
        where: {
          id,
          companyId,
          deletedAt: null
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          variants: {
            where: {
              deletedAt: null
            }
          }
        }
      });

      return product ? this.formatProductResponse(product) : null;
    } catch {
      throw new AppError('Erro ao buscar produto', 500);
    }
  }

  /**
   * Buscar produtos com filtros e paginação
   */
  async findMany(filters: ProductFiltersDto, companyId: string): Promise<ProductListResponseDto> {
    try {
      const {
        search,
        categoryId,
        isActive,
        isService,
        hasVariations,
        minPrice,
        maxPrice,
        inStock,
        lowStock,
        tags,
        page,
        limit,
        sortBy,
        sortOrder
      } = filters;

      const where: Prisma.ProductWhereInput = {
        companyId,
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }),
        ...(categoryId && { categoryId }),
        ...(isActive !== undefined && { isActive }),
        ...(isService !== undefined && { isService }),
        ...(hasVariations !== undefined && { hasVariations }),
        ...(minPrice !== undefined && { salePrice: { gte: minPrice } }),
        ...(maxPrice !== undefined && { salePrice: { lte: maxPrice } }),
        ...(inStock !== undefined && inStock && { currentStock: { gt: 0 } }),
        ...(lowStock !== undefined && lowStock && {
          OR: [
            { currentStock: { lte: 10 } }, // fallback para produtos com estoque baixo
            { currentStock: { lte: this.prisma.product.fields.minStock } }
          ]
        }),
        ...(tags && tags.length > 0 && {
          tags: {
            hasSome: tags
          }
        })
      };

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          include: {
            category: {
              select: {
                id: true,
                name: true,
                description: true
              }
            },
            variants: {
              where: {
                deletedAt: null
              }
            }
          },
          ...(sortBy ? { orderBy: { [sortBy]: sortOrder ?? 'asc' } } : {}),
          skip: (page - 1) * limit,
          take: limit
        }),
        this.prisma.product.count({ where })
      ]);

      const formattedProducts = products.map(product => this.formatProductResponse(product));

      return {
        products: formattedProducts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch {
      throw new AppError('Erro ao buscar produtos', 500);
    }
  }

  /**
   * Atualizar produto
   */
  async update(id: string, data: UpdateProductDto, companyId: string): Promise<ProductResponseDto> {
    try {
      const { dimensions, ...productData } = data;

      // Construir objeto data filtrando undefined para exactOptionalPropertyTypes
      const updateData: any = {
        updatedAt: new Date()
      };

      // Adicionar apenas propriedades definidas
      Object.entries(productData).forEach(([key, value]) => {
        if (value !== undefined) {
          updateData[key] = value;
        }
      });

      // Adicionar dimensões se fornecidas
      if (dimensions) {
        if (dimensions.length !== undefined) updateData.length = dimensions.length;
        if (dimensions.width !== undefined) updateData.width = dimensions.width;
        if (dimensions.height !== undefined) updateData.height = dimensions.height;
      }

      const product = await this.prisma.product.update({
        where: {
          id,
          companyId,
          deletedAt: null
        },
        data: updateData,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          variants: {
            where: {
              deletedAt: null
            }
          }
        }
      });

      return this.formatProductResponse(product);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AppError('SKU já existe para esta empresa', 409);
        }
        if (error.code === 'P2025') {
          throw new AppError('Produto não encontrado', 404);
        }
      }
      throw new AppError('Erro ao atualizar produto', 500);
    }
  }

  /**
   * Deletar produto (soft delete)
   */
  async delete(id: string, companyId: string): Promise<void> {
    try {
      await this.prisma.product.update({
        where: {
          id,
          companyId,
          deletedAt: null
        },
        data: {
          deletedAt: new Date(),
          isActive: false
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new AppError('Produto não encontrado', 404);
        }
      }
      throw new AppError('Erro ao deletar produto', 500);
    }
  }

  /**
   * Restaurar produto
   */
  async restore(id: string, companyId: string): Promise<ProductResponseDto> {
    try {
      const product = await this.prisma.product.update({
        where: {
          id,
          companyId
        },
        data: {
          deletedAt: null,
          isActive: true,
          updatedAt: new Date()
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          variants: {
            where: {
              deletedAt: null
            }
          }
        }
      });

      return this.formatProductResponse(product);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new AppError('Produto não encontrado', 404);
        }
      }
      throw new AppError('Erro ao restaurar produto', 500);
    }
  }

  /**
   * Verificar se SKU existe
   */
  async skuExists(sku: string, companyId: string, excludeId?: string): Promise<boolean> {
    try {
      const product = await this.prisma.product.findFirst({
        where: {
          sku,
          companyId,
          deletedAt: null,
          ...(excludeId && { id: { not: excludeId } })
        }
      });

      return !!product;
    } catch {
      throw new AppError('Erro ao verificar SKU', 500);
    }
  }

  /**
   * Buscar produtos por categoria
   */
  async findByCategory(categoryId: string, companyId: string): Promise<ProductResponseDto[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          categoryId,
          companyId,
          deletedAt: null,
          isActive: true
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          variants: {
            where: {
              deletedAt: null
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      return products.map(product => this.formatProductResponse(product));
    } catch {
      throw new AppError('Erro ao buscar produtos por categoria', 500);
    }
  }

  /**
   * Buscar produtos com estoque baixo
   */
  async findLowStock(companyId: string): Promise<ProductResponseDto[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          companyId,
          deletedAt: null,
          isActive: true,
          isService: false,
          OR: [
            { currentStock: { lte: 10 } }, // produtos com estoque <= 10
            { minStock: { gte: this.prisma.product.fields.currentStock } } // ou onde minStock >= currentStock
          ]
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          variants: {
            where: {
              deletedAt: null
            }
          }
        },
        orderBy: {
          currentStock: 'asc'
        }
      });

      return products.map(product => this.formatProductResponse(product));
    } catch {
      throw new AppError('Erro ao buscar produtos com estoque baixo', 500);
    }
  }

  /**
   * Buscar produtos sem estoque
   */
  async findOutOfStock(companyId: string): Promise<ProductResponseDto[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          companyId,
          deletedAt: null,
          isActive: true,
          isService: false,
          currentStock: 0
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          variants: {
            where: {
              deletedAt: null
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      return products.map(product => this.formatProductResponse(product));
    } catch {
      throw new AppError('Erro ao buscar produtos sem estoque', 500);
    }
  }

  /**
   * Obter estatísticas de produtos
   */
  async getStats(companyId: string): Promise<ProductStatsDto> {
    try {
      const [stats, topCategories, recentlyAdded] = await Promise.all([
        this.prisma.product.aggregate({
          where: {
            companyId,
            deletedAt: null
          },
          _count: {
            id: true
          },
          _sum: {
            currentStock: true
          },
          _avg: {
            salePrice: true
          }
        }),
        this.prisma.productCategory.findMany({
          where: {
            companyId,
            deletedAt: null
          },
          include: {
            _count: {
              select: {
                products: {
                  where: {
                    deletedAt: null
                  }
                }
              }
            }
          },
          orderBy: {
            products: {
              _count: 'desc'
            }
          },
          take: 5
        }),
        this.prisma.product.findMany({
          where: {
            companyId,
            deletedAt: null
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                description: true
              }
            },
            variants: {
              where: {
                deletedAt: null
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        })
      ]);

      const [activeCount, inactiveCount, servicesCount, physicalCount, variationsCount, lowStockCount, outOfStockCount] = await Promise.all([
        this.prisma.product.count({
          where: {
            companyId,
            deletedAt: null,
            isActive: true
          }
        }),
        this.prisma.product.count({
          where: {
            companyId,
            deletedAt: null,
            isActive: false
          }
        }),
        this.prisma.product.count({
          where: {
            companyId,
            deletedAt: null,
            isService: true
          }
        }),
        this.prisma.product.count({
          where: {
            companyId,
            deletedAt: null,
            isService: false
          }
        }),
        this.prisma.product.count({
          where: {
            companyId,
            deletedAt: null,
            hasVariations: true
          }
        }),
        this.prisma.$queryRaw`
          SELECT COUNT(*) as count
          FROM "Product"
          WHERE "companyId" = ${companyId}
            AND "deletedAt" IS NULL
            AND "isActive" = true
            AND "isService" = false
            AND "currentStock" <= "minStock"
        `,
        this.prisma.product.count({
          where: {
            companyId,
            deletedAt: null,
            isActive: true,
            isService: false,
            currentStock: 0
          }
        })
      ]);

      // Calcular valor total do estoque
      const stockValue = await this.prisma.product.aggregate({
        where: {
          companyId,
          deletedAt: null,
          isService: false
        },
        _sum: {
          currentStock: true
        }
      });

      const totalStockValue = stockValue._sum.currentStock || 0;

      return {
        totalProducts: stats._count.id,
        activeProducts: activeCount,
        inactiveProducts: inactiveCount,
        services: servicesCount,
        physicalProducts: physicalCount,
        productsWithVariations: variationsCount,
        lowStockProducts: Array.isArray(lowStockCount) ? lowStockCount[0]?.count || 0 : 0,
        outOfStockProducts: outOfStockCount,
        totalStockValue,
        averagePrice: stats._avg.salePrice ? Number(stats._avg.salePrice) : 0,
        topCategories: topCategories.map(category => ({
          categoryId: category.id,
          categoryName: category.name,
          productCount: category._count.products || 0
        })),
        recentlyAdded: recentlyAdded.map(product => this.formatProductResponse(product))
      };
    } catch {
      throw new AppError('Erro ao obter estatísticas de produtos', 500);
    }
  }

  /**
   * Atualizar estoque do produto
   */
  async updateStock(id: string, newStock: number, companyId: string): Promise<void> {
    try {
      await this.prisma.product.update({
        where: {
          id,
          companyId,
          deletedAt: null
        },
        data: {
          currentStock: newStock,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new AppError('Produto não encontrado', 404);
        }
      }
      throw new AppError('Erro ao atualizar estoque', 500);
    }
  }

  /**
   * Buscar produtos para relatório
   */
  async findForReport(filters: Record<string, unknown>, companyId: string): Promise<ProductResponseDto[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          companyId,
          deletedAt: null,
          ...filters
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          variants: {
            where: {
              deletedAt: null
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      return products.map(product => this.formatProductResponse(product));
    } catch {
      throw new AppError('Erro ao buscar produtos para relatório', 500);
    }
  }

  /**
   * Formatar resposta do produto
   */
  private formatProductResponse(product: unknown): ProductResponseDto {
    const prod = product as {
      id: string;
      name: string;
      description?: string;
      sku: string;
      barcode?: string;
      categoryId?: string;
      category?: { id: string; name: string; description?: string };
      unit: string;
      costPrice: number;
      salePrice: number;
      minStock: number;
      maxStock?: number;
      currentStock: number;
      location?: string;
      weight?: number;
      length?: number;
      width?: number;
      height?: number;
      images?: string[];
      isActive: boolean;
      isService: boolean;
      hasVariations: boolean;
      variants?: Array<{
        id: string;
        name: string;
        sku: string;
        costPrice: number;
        salePrice: number;
        stock: number;
        attributes?: string;
      }>;
      tags?: string[];
      notes?: string;
      companyId: string;
      createdAt: Date;
      updatedAt: Date;
      deletedAt?: Date;
    };
    
    return {
      id: prod.id,
      name: prod.name,
      description: prod.description ?? '',
      sku: prod.sku,
      barcode: prod.barcode ?? null,
      categoryId: prod.categoryId ?? null,
      category: prod.category ? {
        id: prod.category.id,
        name: prod.category.name,
        description: prod.category.description ?? null
      } : undefined,
      unitOfMeasure: prod.unit,
      unit: prod.unit,
      trackStock: (prod as any).trackStock ?? true,
      wholesalePrice: (prod as any).wholesalePrice ?? null,
      profitMargin: (prod as any).profitMargin ?? null,
      costPrice: prod.costPrice,
      salePrice: prod.salePrice,
      minStock: prod.minStock,
      maxStock: prod.maxStock ?? null,
      currentStock: prod.currentStock,
      location: prod.location ?? null,
      weight: prod.weight ?? null,
      dimensions: {
        length: prod.length ?? null,
        width: prod.width ?? null,
        height: prod.height ?? null
      },
      length: prod.length ?? null,
      width: prod.width ?? null,
      height: prod.height ?? null,
      images: prod.images || [],
      isActive: prod.isActive,
      isService: prod.isService,
      hasVariations: prod.hasVariations,
      variations: prod.variants?.map((variation) => ({
        id: variation.id,
        name: variation.name,
        sku: variation.sku,
        costPrice: variation.costPrice,
        salePrice: variation.salePrice,
        stock: variation.stock,
        attributes: variation.attributes ? JSON.parse(variation.attributes) : {}
      })) || [],
      tags: prod.tags || [],
      notes: prod.notes ?? null,
      companyId: prod.companyId,
      createdAt: prod.createdAt,
      updatedAt: prod.updatedAt,
      deletedAt: (prod.deletedAt ?? null) as Date | null
    };
  }
}