import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { ProductService } from './product.service';
import { ProductRepository, ProductCategoryRepository, StockMovementRepository } from '../repositories';

// Mock dos repositórios (instâncias únicas para sincronizar com o serviço)
vi.mock('../repositories', () => {
  const productRepoMock = {
    findAll: vi.fn(),
    findMany: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findByCategory: vi.fn(),
    restore: vi.fn(),
    formatProductResponse: vi.fn((product: any) => product),
    skuExists: vi.fn().mockResolvedValue(false)
  };

  const categoryRepoMock = {
    findById: vi.fn().mockResolvedValue({ id: 'cat-123', isActive: true })
  } as any;
  const stockMovementRepoMock = {
    create: vi.fn()
  } as any;

  return {
    ProductRepository: vi.fn(() => productRepoMock),
    ProductCategoryRepository: vi.fn(() => categoryRepoMock),
    StockMovementRepository: vi.fn(() => stockMovementRepoMock)
  };
});

// Mock do PrismaClient
vi.mock('@prisma/client', () => {
  const PrismaClient = vi.fn();
  return { PrismaClient };
});

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: any;
  let categoryRepository: any;
  let stockMovementRepository: any;
  const prisma = new PrismaClient();
  const userId = 'user-123';
  const companyId = 'company-123';

  beforeEach(() => {
    vi.clearAllMocks();
    productRepository = new ProductRepository(prisma);
    categoryRepository = new ProductCategoryRepository(prisma);
    stockMovementRepository = new StockMovementRepository(prisma);
    
    // Criar instância do serviço com os repositórios mockados
    productService = new ProductService(prisma);
    
    // Mock do método de validação de permissão
    (productService as any).validatePermission = vi.fn().mockResolvedValue(true);
  });

  it('deve listar produtos com filtros', async () => {
    const mockProducts = [
      { id: '1', name: 'Produto 1', price: 100 },
      { id: '2', name: 'Produto 2', price: 200 },
    ];

    (productRepository.findMany as any).mockResolvedValue({
      products: mockProducts,
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    const result = await productService.findMany({}, companyId, userId);
    
    expect(productRepository.findMany).toHaveBeenCalled();
    expect(result.products.length).toBeGreaterThanOrEqual(0);
  });

  it('deve buscar um produto por ID', async () => {
    const mockProduct = { id: '1', name: 'Produto 1', price: 100 };
    
    (productRepository.findById as any).mockResolvedValue(mockProduct);

    const result = await productService.findById('1', companyId, userId);
    
    expect(productRepository.findById).toHaveBeenCalledWith('1', companyId);
  });

  it('deve criar um novo produto', async () => {
    const productData = { 
      name: 'Novo Produto', 
      sku: 'SKU123', 
      categoryId: 'cat-123',
      unitOfMeasure: 'un',
      costPrice: 100,
      salePrice: 150,
      minStock: 10
    };
    const mockCreatedProduct = { id: '3', ...productData };
    
    (productRepository.create as any).mockResolvedValue(mockCreatedProduct);

    const result = await productService.create(productData, companyId, userId);
    
    expect(productRepository.create).toHaveBeenCalled();
  });

  it('deve atualizar um produto existente', async () => {
    const productId = '1';
    const updateData = { name: 'Produto Atualizado', price: 120 };
    const mockUpdatedProduct = { id: productId, ...updateData };
    
    (productRepository.findById as any).mockResolvedValue({ id: productId, name: 'Produto 1' });
    (productRepository.update as any).mockResolvedValue(mockUpdatedProduct);

    const result = await productService.update(productId, updateData, companyId, userId);
    
    expect(productRepository.update).toHaveBeenCalled();
  });

  it('deve excluir um produto', async () => {
    const productId = '1';
    const companyId = '1';
    const userId = '1';
    
    // Mock para o método canDeleteProduct
    vi.spyOn(productService, 'canDeleteProduct').mockResolvedValue({ canDelete: true });
    
    // Mock para o método validatePermission
    vi.spyOn(productService as any, 'validatePermission').mockResolvedValue(true);

    await productService.delete(productId, companyId, userId);
    
    expect(productRepository.delete).toHaveBeenCalledWith(productId, companyId);
  });
});