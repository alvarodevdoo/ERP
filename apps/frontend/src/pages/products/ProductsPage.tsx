import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Package, RefreshCw, FolderTree, FilterX } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ProductModal } from '@/components/ProductModal'
import { CategoryModal } from '@/components/CategoryModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { productsService, Product } from '@/services/products'
import { categoriesService, Category } from '@/services/categories'

export default function ProductsPage() {
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive' | 'deleted'>('all')
  const [page, setPage] = useState(1)
  const [itemsPerPage] = useState(12) // Produtos por página
  const [includeDeleted, setIncludeDeleted] = useState(false) // Novo estado para incluir produtos excluídos
  
  // Estados para modais
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  void actionLoading

  // Filtros para a API
  const filters = useMemo(() => ({
    search: searchTerm,
    categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
    isActive: selectedStatus === 'all' ? undefined : selectedStatus === 'active' ? true : selectedStatus === 'inactive' ? false : undefined,
    showDeleted: selectedStatus === 'deleted' ? true : undefined,
    page,
    limit: itemsPerPage,
    sortBy: 'name',
    sortOrder: 'asc'
  }), [searchTerm, selectedCategory, selectedStatus, page, itemsPerPage])
  void filters

  // Hooks de dados e mutação
  // const { data: productsData, isLoading, error, refetch } = useProducts(filters)
  // const createProductMutation = useCreateProduct()
  // const updateProductMutation = useUpdateProduct()
  // const deleteProductMutation = useDeleteProduct()
  // const generateReportMutation = useGenerateProductReport()
  // const restoreProductMutation = useRestoreProduct() // Initialize the new mutation

  // Estados para dados
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [totalPages, setTotalPages] = useState(1)

  // Buscar produtos
  const fetchProducts = async () => {
    try {
      setError(null)
      const response = await productsService.getAll(filters)
      setProducts(response.data)
      setTotalPages(response.meta.totalPages)
    } catch (err) {
      setError(err as Error)
      toast.error('Erro ao carregar produtos')
    }
  }

  // Buscar categorias
  const fetchCategories = async () => {
    try {
      const response = await categoriesService.getAll()
      setCategories(response.data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, selectedStatus, page, itemsPerPage])

  // Carregamento inicial
  useEffect(() => {
    setIsLoading(false)
  }, [])

  const refetch = fetchProducts

  // Formatar produtos para exibição
  const formattedProducts = products.map(prod => ({
    ...prod,
    price: prod.salePrice,
    stock: prod.currentStock,
    category: prod.category || { name: 'Sem categoria' }
  }))

  // Handlers para modais
  const handleNewProduct = () => {
    setModalMode('create')
    setSelectedProduct(null)
    setIsProductModalOpen(true)
  }

  const handleEdit = (productId: string) => {
    const product = formattedProducts.find((p: Product) => p.id === productId)
    if (product) {
      setModalMode('edit')
      setSelectedProduct(product)
      setIsProductModalOpen(true)
    }
  }

  const handleSaveProduct = async (productData: Partial<Product>) => {
    setActionLoading(true)
    try {
      if (modalMode === 'create') {
        await productsService.create(productData)
        toast.success('Produto criado com sucesso!')
      } else {
        if (!selectedProduct) {
          toast.error('Nenhum produto selecionado para edição.')
          return
        }
        await productsService.update(selectedProduct.id, productData)
        toast.success('Produto atualizado com sucesso!')
      }
      handleCloseModals()
      refetch()
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      toast.error('Erro ao salvar produto. Tente novamente.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = (productId: string) => {
    const product = formattedProducts.find((p: Product) => p.id === productId)
    if (product) {
      setProductToDelete(product)
      setIsConfirmDialogOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete) return
    setActionLoading(true)
    try {
      await productsService.delete(productToDelete.id)
      toast.success('Produto excluído com sucesso!')
      handleCloseModals()
      refetch()
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      toast.error('Erro ao excluir produto. Tente novamente.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRestore = async (productId: string) => {
    try {
      await productsService.restore(productId)
      toast.success('Produto restaurado com sucesso!')
      refetch()
    } catch (error) {
      console.error('Erro ao restaurar produto:', error)
      toast.error('Erro ao restaurar produto. Tente novamente.')
    }
  }

  const handleGenerateReport = () => {
    toast.info('Funcionalidade de relatório em desenvolvimento')
  }

  

  // Limpar filtros
  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedStatus('all')
    setIncludeDeleted(false)
    setPage(1)
  }

  // Verificar se há filtros ativos
  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || includeDeleted

  const handleCloseModals = () => {
    setIsProductModalOpen(false)
    setIsConfirmDialogOpen(false)
    setSelectedProduct(null)
    setProductToDelete(null)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground mt-1">Gerencie seu catálogo de produtos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            <FolderTree className="h-4 w-4 mr-2" />
            Categorias
          </Button>
          <Button
            variant="outline"
            onClick={handleGenerateReport}
            disabled={false}
          >
            Gerar Relatório
          </Button>
          <Button onClick={handleNewProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou SKU..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex-1">
              <label htmlFor="category-filter" className="sr-only">Filtrar por Categoria</label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="status-filter" className="sr-only">Filtrar por Status</label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'inactive' | 'deleted')}
                className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="deleted">Excluídos</option>
              </select>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearFilters}
              title="Limpar filtros"
              disabled={!hasActiveFilters}
            >
              <FilterX className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-2">Erro ao carregar produtos</p>
            <Button onClick={() => refetch()}>Tentar novamente</Button>
          </div>
        </div>
      ) : formattedProducts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">
              {hasActiveFilters 
                ? 'Tente ajustar os filtros de pesquisa'
                : 'Comece criando seu primeiro produto'
              }
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-4">
                Limpar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formattedProducts.map((prod: Product) => (
            <Card key={prod.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{prod.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{prod.description}</p>
                  </div>
                  
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(prod.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {prod.deletedAt ? ( // Conditionally display restore button
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(prod.id)} // New handler
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(prod.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Categoria:</span>
                    <span className="text-sm font-medium">
                      {typeof prod.category === 'string' ? prod.category : prod.category.name}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Preço:</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(prod.price)}
                    </span>
                  </div>
                  
                  {prod.trackStock && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estoque:</span>
                      <span className={`text-sm font-medium ${
                        prod.stock > 10 ? 'text-green-600' : 
                        prod.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {prod.stock} unidades
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      prod.isActive
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {prod.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Modais */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveProduct}
        product={selectedProduct}
        mode={modalMode}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false)
          fetchCategories()
        }}
      />
      
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDelete}
        title="Excluir Produto"
        description={`Tem certeza que deseja excluir o produto "${productToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        loading={false} // deleteProductMutation.isPending
      />
    </div>
  )
}