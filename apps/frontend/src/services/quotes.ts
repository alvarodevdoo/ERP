import { api } from './api'

export interface QuoteItem {
  id?: string
  productId: string
  productName?: string
  productCode?: string
  quantity: number
  unitPrice: number
  discount: number
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue?: number
  subtotal?: number
  total?: number
  observations?: string
}

export interface Quote {
  id: string
  number: string
  customerId: string
  customerName: string
  customerDocument?: string
  title: string
  description?: string
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED'
  validUntil: string
  paymentTerms?: string
  deliveryTerms?: string
  observations?: string
  discount: number
  discountType: 'PERCENTAGE' | 'FIXED'
  subtotal: number
  discountValue: number
  totalValue: number
  items: QuoteItem[]
  createdAt: string
  updatedAt: string
  createdBy: string
  createdByName: string
}

export interface QuoteFilters {
  search?: string
  customerId?: string
  status?: Quote['status']
  startDate?: string
  endDate?: string
  minValue?: number
  maxValue?: number
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'validUntil' | 'totalValue' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateQuoteData {
  customerId: string
  title: string
  description?: string
  validUntil: string
  paymentTerms?: string
  deliveryTerms?: string
  observations?: string
  discount?: number
  discountType?: 'PERCENTAGE' | 'FIXED'
  items: Omit<QuoteItem, 'id' | 'productName' | 'productCode' | 'discountValue' | 'subtotal' | 'total'>[]
}

export interface UpdateQuoteData extends Partial<CreateQuoteData> {}

export const quotesService = {
  async getAll(filters?: QuoteFilters) {
    const { data } = await api.get<{ data: Quote[]; meta: any }>('/quotes', { params: filters })
    return data
  },

  async getById(id: string) {
    const { data } = await api.get<Quote>(`/quotes/${id}`)
    return data
  },

  async create(quoteData: CreateQuoteData) {
    const { data } = await api.post<Quote>('/quotes', quoteData)
    return data
  },

  async update(id: string, quoteData: UpdateQuoteData) {
    const { data } = await api.put<Quote>(`/quotes/${id}`, quoteData)
    return data
  },

  async delete(id: string) {
    await api.delete(`/quotes/${id}`)
  },

  async updateStatus(id: string, status: Quote['status'], reason?: string) {
    const { data } = await api.patch<Quote>(`/quotes/${id}/status`, { status, reason })
    return data
  },

  async duplicate(id: string, data?: { title?: string; customerId?: string; validUntil?: string }) {
    const { data: quote } = await api.post<Quote>(`/quotes/${id}/duplicate`, data)
    return quote
  },

  async convertToOrder(id: string, data?: { deliveryDate?: string; priority?: string; observations?: string }) {
    const { data: result } = await api.post(`/quotes/${id}/convert-to-order`, data)
    return result
  },

  async generatePDF(id: string) {
    const { data } = await api.get(`/quotes/${id}/pdf`, { responseType: 'blob' })
    return data
  }
}
