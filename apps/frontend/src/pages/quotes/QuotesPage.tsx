import { useState, useEffect } from 'react'
import { Plus, Search, Eye, Edit, Trash2, FileText, Calendar } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { QuoteModal } from '@/components/QuoteModal'
import { QuoteViewModal } from '@/components/QuoteViewModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { quotesService, Quote } from '@/services/quotes'

export function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  
  // Estados para controlar os modais
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadQuotes()
  }, [searchTerm, selectedStatus])

  const loadQuotes = async () => {
    try {
      setLoading(true)
      const response = await quotesService.getAll({
        search: searchTerm || undefined,
        status: selectedStatus === 'all' ? undefined : selectedStatus as Quote['status'],
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
      setQuotes(response.data)
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error)
      toast.error('Erro ao carregar orçamentos')
    } finally {
      setLoading(false)
    }
  }

  const filteredQuotes = quotes

  const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'DRAFT', label: 'Rascunho' },
    { value: 'SENT', label: 'Enviado' },
    { value: 'APPROVED', label: 'Aprovado' },
    { value: 'REJECTED', label: 'Rejeitado' },
    { value: 'EXPIRED', label: 'Expirado' },
    { value: 'CONVERTED', label: 'Convertido' }
  ]

  const getStatusColor = (status: Quote['status']) => {
    const colors = {
      DRAFT: 'bg-gray-500 text-white',
      SENT: 'bg-blue-500 text-white',
      APPROVED: 'bg-green-500 text-white',
      REJECTED: 'bg-red-500 text-white',
      EXPIRED: 'bg-orange-500 text-white',
      CONVERTED: 'bg-purple-500 text-white'
    }
    return colors[status]
  }

  const getStatusLabel = (status: Quote['status']) => {
    const labels = {
      DRAFT: 'Rascunho',
      SENT: 'Enviado',
      APPROVED: 'Aprovado',
      REJECTED: 'Rejeitado',
      EXPIRED: 'Expirado',
      CONVERTED: 'Convertido'
    }
    return labels[status]
  }

  // Handlers para gerenciar os modais
  const handleNewQuote = () => {
    setModalMode('create')
    setSelectedQuote(null)
    setIsQuoteModalOpen(true)
  }

  const handleView = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId)
    if (quote) {
      setSelectedQuote(quote)
      setIsViewModalOpen(true)
    }
  }

  const handleEdit = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId)
    if (quote) {
      setModalMode('edit')
      setSelectedQuote(quote)
      setIsQuoteModalOpen(true)
    }
  }

  const handleDelete = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId)
    if (quote) {
      setQuoteToDelete(quote)
      setIsConfirmDialogOpen(true)
    }
  }

  const handleSaveQuote = async (quoteData: any) => {
    setActionLoading(true)
    
    try {
      if (modalMode === 'create') {
        await quotesService.create(quoteData)
        toast.success('Orçamento criado com sucesso!')
      } else if (selectedQuote) {
        await quotesService.update(selectedQuote.id, quoteData)
        toast.success('Orçamento atualizado com sucesso!')
      }
      handleCloseModals()
      loadQuotes()
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error)
      toast.error('Erro ao salvar orçamento')
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!quoteToDelete) return
    
    setActionLoading(true)
    
    try {
      await quotesService.delete(quoteToDelete.id)
      toast.success('Orçamento excluído com sucesso!')
      handleCloseModals()
      loadQuotes()
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error)
      toast.error('Erro ao excluir orçamento')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCloseModals = () => {
    setIsQuoteModalOpen(false)
    setIsViewModalOpen(false)
    setIsConfirmDialogOpen(false)
    setSelectedQuote(null)
    setQuoteToDelete(null)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-600">Gerencie seus orçamentos e propostas</p>
        </div>
        
        <Button onClick={handleNewQuote}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar orçamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum orçamento encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou crie um novo orçamento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{quote.number}</h3>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                        {getStatusLabel(quote.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Cliente: </span>
                        <span className="font-medium">{quote.customerName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Valor Total: </span>
                        <span className="font-bold text-primary text-lg">
                          {formatCurrency(quote.totalValue)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Válido até: </span>
                        <span className="font-medium">{formatDate(quote.validUntil)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Criado em: </span>
                        <span className="font-medium">{formatDate(quote.createdAt)}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm">{quote.description}</p>
                  </div>
                  
                  <div className="flex gap-2 lg:flex-col">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(quote.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(quote.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(quote.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Modais */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveQuote}
        quote={selectedQuote}
        mode={modalMode}
      />
      
      <QuoteViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModals}
        quote={selectedQuote}
      />
      
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDelete}
        title="Excluir Orçamento"
        description={`Tem certeza que deseja excluir o orçamento ${quoteToDelete?.number}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  )
}