import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { api } from '@/services/api'

interface Customer {
  id?: string
  name: string
  email?: string
  phone?: string
  document?: string
  isActive?: boolean
  address?: {
    street?: string
    number?: string
    city?: string
    state?: string
    zipCode?: string
  }
}

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
}

export default function CustomerModal({ isOpen, onClose, customer }: CustomerModalProps) {
  const [formData, setFormData] = useState<Customer>({
    name: '',
    email: '',
    phone: '',
    document: '',
    address: {}
  })

  useEffect(() => {
    if (customer) {
      setFormData(customer)
    } else {
      setFormData({ name: '', email: '', phone: '', document: '', address: {} })
    }
  }, [customer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        type: 'CUSTOMER',
        isActive: formData.isActive ?? true
      }

      if (customer?.id) {
        await api.put(`/partners/${customer.id}`, payload)
      } else {
        await api.post('/partners', payload)
      }
      onClose()
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          <DialogDescription className="sr-only">Formulário para criar ou editar cliente</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Nome *</Label>
              <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <Label>Documento (CPF/CNPJ)</Label>
              <Input value={formData.document} onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.value }))} />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Endereço</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CEP</Label>
                <Input value={formData.address?.zipCode} onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, zipCode: e.target.value } }))} />
              </div>
              <div>
                <Label>Rua</Label>
                <Input value={formData.address?.street} onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, street: e.target.value } }))} />
              </div>
              <div>
                <Label>Número</Label>
                <Input value={formData.address?.number} onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, number: e.target.value } }))} />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input value={formData.address?.city} onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))} />
              </div>
              <div>
                <Label>Estado</Label>
                <Input value={formData.address?.state} onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
