import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { X, Plus } from 'lucide-react'
import { productsService } from '@/services/products'
import { api } from '@/services/api'

interface QuoteItem {
  productId: string
  productName?: string
  quantity: number
  unitPrice: number
  discount: number
  discountType: 'PERCENTAGE' | 'FIXED'
  observations?: string
}

interface QuoteFormData {
  customerId: string
  title: string
  description?: string
  validUntil: string
  paymentTerms?: string
  deliveryTerms?: string
  observations?: string
  discount: number
  discountType: 'PERCENTAGE' | 'FIXED'
  items: QuoteItem[]
  customerPhone?: string
}

interface QuoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (quote: QuoteFormData) => void
  quote?: any
  mode: 'create' | 'edit'
}

export function QuoteModal({ isOpen, onClose, onSave, quote, mode }: QuoteModalProps) {
  const [formData, setFormData] = useState<QuoteFormData>({
    customerId: '',
    title: '',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    discount: 0,
    discountType: 'PERCENTAGE',
    items: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0, discountType: 'PERCENTAGE' }]
  })
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerResults, setCustomerResults] = useState<any[]>([])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [customerPhone, setCustomerPhone] = useState('')
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isOpen) {
      loadProducts()
      if (mode === 'edit' && quote) {
        setFormData({
          customerId: quote.customerId,
          title: quote.title,
          description: quote.description,
          validUntil: new Date(quote.validUntil).toISOString().split('T')[0],
          paymentTerms: quote.paymentTerms,
          deliveryTerms: quote.deliveryTerms,
          observations: quote.observations,
          discount: quote.discount,
          discountType: quote.discountType,
          items: quote.items
        })
        setCustomerSearch(quote.customerName || '')
        setSelectedCustomer({ id: quote.customerId, name: quote.customerName })
      } else {
        setFormData({
          customerId: '',
          title: '',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          discount: 0,
          discountType: 'PERCENTAGE',
          items: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0, discountType: 'PERCENTAGE' }]
        })
        setCustomerSearch('')
        setSelectedCustomer(null)
        setCustomerPhone('')
      }
    }
  }, [isOpen, mode, quote])

  useEffect(() => {
    if (customerSearch.length >= 2) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = setTimeout(() => searchCustomers(customerSearch), 300)
    } else {
      setCustomerResults([])
      setShowCustomerDropdown(false)
    }
    setHighlightedIndex(0)
  }, [customerSearch])

  const searchCustomers = async (search: string) => {
    try {
      const response = await api.get('/partners', { params: { search, type: 'CUSTOMER' } })
      setCustomerResults(response.data.data || [])
      setShowCustomerDropdown(true)
      setHighlightedIndex(0)
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showCustomerDropdown || customerResults.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => (prev < customerResults.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault()
      selectCustomer(customerResults[highlightedIndex])
    } else if (e.key === 'Escape') {
      setShowCustomerDropdown(false)
    }
  }

  const selectCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setCustomerSearch(customer.name)
    setCustomerPhone(customer.phone || '')
    setFormData(prev => ({ ...prev, customerId: customer.id }))
    setShowCustomerDropdown(false)
    setShowNewCustomerForm(false)
  }

  const createNewCustomer = async () => {
    if (!customerPhone) {
      alert('Por favor, informe o telefone do cliente')
      return
    }
    try {
      const response = await api.post('/partners', {
        name: customerSearch,
        phone: customerPhone,
        type: 'CUSTOMER',
        isActive: true
      })
      const newCustomer = response.data.data
      selectCustomer(newCustomer)
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await productsService.getAll()
      setProducts(response.data || [])
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const submitData = {
        ...formData,
        validUntil: new Date(formData.validUntil).toISOString(),
        items: formData.items.map(({ productName, ...item }) => item)
      }
      onSave(submitData)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error)
    } finally {
      setLoading(false)
    }
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitPrice: 0, discount: 0, discountType: 'PERCENTAGE' }]
    }))
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          if (field === 'productId') {
            const product = products.find(p => p.id === value)
            return { ...item, productId: value, productName: product?.name, unitPrice: product?.salePrice || 0 }
          }
          return { ...item, [field]: value }
        }
        return item
      })
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Novo Orçamento' : 'Editar Orçamento'}</DialogTitle>
          <DialogDescription className="sr-only">Formulário para criar ou editar orçamento</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Label>Cliente *</Label>
              <Input
                placeholder="Digite o nome do cliente"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value)
                  if (!e.target.value) {
                    setSelectedCustomer(null)
                    setCustomerPhone('')
                    setShowNewCustomerForm(false)
                    setFormData(prev => ({ ...prev, customerId: '' }))
                  }
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => customerResults.length > 0 && setShowCustomerDropdown(true)}
                required
              />
              {showCustomerDropdown && customerResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-auto">
                  {customerResults.map((customer, index) => (
                    <div
                      key={customer.id}
                      className={`px-3 py-2 cursor-pointer ${
                        index === highlightedIndex
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => selectCustomer(customer)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div className="font-medium">{customer.name}</div>
                      {customer.phone && <div className="text-sm text-gray-500">{customer.phone}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label>Telefone *</Label>
              <div className="flex gap-2">
                <Input 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  disabled={!!selectedCustomer} 
                  className={selectedCustomer ? "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 opacity-100" : ""}
                />
                {!selectedCustomer && customerSearch && (
                  <Button type="button" onClick={createNewCustomer} size="sm">
                    Criar
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label>Título *</Label>
              <Input value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
            </div>
            <div>
              <Label>Válido até *</Label>
              <Input type="date" value={formData.validUntil} onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))} required />
            </div>
            <div>
              <Label>Desconto</Label>
              <div className="flex gap-2">
                <Input type="number" step="0.01" value={formData.discount} onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))} />
                <select className="px-3 py-2 border rounded-md" value={formData.discountType} onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' }))}>
                  <option value="PERCENTAGE">%</option>
                  <option value="FIXED">R$</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <Label>Descrição</Label>
            <textarea className="w-full px-3 py-2 border rounded-md" rows={2} value={formData.description || ''} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Itens *</Label>
              <Button type="button" size="sm" onClick={addItem}><Plus className="h-4 w-4" /></Button>
            </div>
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2 items-start">
                <select className="flex-1 px-3 py-2 border rounded-md" value={item.productId} onChange={(e) => updateItem(index, 'productId', e.target.value)} required>
                  <option value="">Selecione um produto</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <Input type="number" step="0.01" min="0.01" placeholder="Qtd" className="w-20" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 1)} required />
                <Input type="number" step="0.01" min="0" placeholder="Preço" className="w-28" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)} required />
                <Button type="button" size="sm" variant="outline" onClick={() => removeItem(index)} disabled={formData.items.length === 1}><X className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : mode === 'create' ? 'Criar' : 'Salvar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}