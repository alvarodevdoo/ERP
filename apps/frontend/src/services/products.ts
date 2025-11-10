import { api } from './api'

export interface Product {
  id: string
  name: string
  description?: string
  sku: string
  categoryId?: string
  category?: { id: string; name: string; description?: string }
  unit: string
  costPrice: number
  salePrice: number
  wholesalePrice?: number
  profitMargin?: number
  minStock: number
  currentStock: number
  trackStock: boolean
  weight?: number
  length?: number
  width?: number
  height?: number
  isActive: boolean
  isService: boolean
  hasVariations: boolean
  variations?: Array<{
    id: string
    name: string
    sku: string
    costPrice: number
    salePrice: number
    stock: number
    attributes?: Record<string, unknown>
  }>
  companyId: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface ProductFilters {
  search?: string
  categoryId?: string
  isActive?: boolean
  showDeleted?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ProductsResponse {
  success: boolean
  data: Product[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const productsService = {
  async getAll(filters?: ProductFilters): Promise<ProductsResponse> {
    const { data } = await api.get('/products', { params: filters })
    return data
  },

  async getById(id: string): Promise<{ success: boolean; data: Product }> {
    const { data } = await api.get(`/products/${id}`)
    return data
  },

  async create(product: Partial<Product>): Promise<{ success: boolean; data: Product; message: string }> {
    const { data } = await api.post('/products', product)
    return data
  },

  async update(id: string, product: Partial<Product>): Promise<{ success: boolean; data: Product; message: string }> {
    const { data } = await api.put(`/products/${id}`, product)
    return data
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/products/${id}`)
    return data
  },

  async restore(id: string): Promise<{ success: boolean; data: Product; message: string }> {
    const { data } = await api.patch(`/products/${id}/restore`)
    return data
  }
}
