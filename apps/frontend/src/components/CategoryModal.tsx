import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { categoriesService, Category } from '@/services/categories'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CategoryModal({ isOpen, onClose }: CategoryModalProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await categoriesService.getAll()
      setCategories(response.data)
    } catch (error) {
      toast.error('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      if (editingId) {
        await categoriesService.update(editingId, formData)
        toast.success('Categoria atualizada!')
      } else {
        await categoriesService.create({ ...formData, isActive: true })
        toast.success('Categoria criada!')
      }
      setFormData({ name: '', description: '' })
      setEditingId(null)
      fetchCategories()
    } catch (error) {
      toast.error('Erro ao salvar categoria')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setFormData({ name: category.name, description: category.description || '' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta categoria?')) return
    
    try {
      await categoriesService.delete(id)
      toast.success('Categoria excluída!')
      fetchCategories()
    } catch (error) {
      toast.error('Erro ao excluir categoria')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ name: '', description: '' })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome da categoria"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição (opcional)"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                {editingId ? 'Atualizar' : <><Plus className="h-4 w-4 mr-1" /> Adicionar</>}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>

          {/* Lista de Categorias */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-4 text-gray-500">Carregando...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Nenhuma categoria cadastrada</div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{category.name}</p>
                    {category.description && (
                      <p className="text-sm text-gray-600">{category.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
