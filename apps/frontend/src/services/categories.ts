import { api } from './api'

export interface Category {
  id: string
  name: string
  description?: string
  parentId?: string
  isActive: boolean
  sortOrder: number
  companyId: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export const categoriesService = {
  async getAll(): Promise<{ success: boolean; data: Category[] }> {
    const { data } = await api.get('/product-categories')
    return data
  },

  async create(category: Partial<Category>): Promise<{ success: boolean; data: Category; message: string }> {
    const { data } = await api.post('/product-categories', category)
    return data
  },

  async update(id: string, category: Partial<Category>): Promise<{ success: boolean; data: Category; message: string }> {
    const { data } = await api.put(`/product-categories/${id}`, category)
    return data
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/product-categories/${id}`)
    return data
  }
}
