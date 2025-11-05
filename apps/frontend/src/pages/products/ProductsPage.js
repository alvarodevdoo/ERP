import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProductModal } from '@/components/ProductModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
export function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    // Estados para modais
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    useEffect(() => {
        // Simular carregamento de produtos
        const loadProducts = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockProducts = [
                {
                    id: '1',
                    name: 'Produto A',
                    description: 'Descrição do produto A',
                    category: 'Categoria 1',
                    price: 99.90,
                    stock: 50,
                    status: 'active',
                    createdAt: '2024-01-15'
                },
                {
                    id: '2',
                    name: 'Produto B',
                    description: 'Descrição do produto B',
                    category: 'Categoria 2',
                    price: 149.90,
                    stock: 25,
                    status: 'active',
                    createdAt: '2024-01-10'
                },
                {
                    id: '3',
                    name: 'Produto C',
                    description: 'Descrição do produto C',
                    category: 'Categoria 1',
                    price: 79.90,
                    stock: 0,
                    status: 'inactive',
                    createdAt: '2024-01-05'
                }
            ];
            setProducts(mockProducts);
            setLoading(false);
        };
        loadProducts();
    }, []);
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
    // Handlers para modais
    const handleNewProduct = () => {
        setModalMode('create');
        setSelectedProduct(null);
        setIsProductModalOpen(true);
    };
    const handleEdit = (productId) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            setModalMode('edit');
            setSelectedProduct(product);
            setIsProductModalOpen(true);
        }
    };
    const handleDelete = (productId) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            setProductToDelete(product);
            setIsConfirmDialogOpen(true);
        }
    };
    const handleSaveProduct = async (productData) => {
        try {
            if (modalMode === 'create') {
                // Criar novo produto
                const newProduct = {
                    ...productData,
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString().split('T')[0]
                };
                setProducts(prev => [...prev, newProduct]);
                toast.success('Produto criado com sucesso!');
            }
            else {
                // Editar produto existente
                setProducts(prev => prev.map(p => p.id === selectedProduct?.id
                    ? { ...p, ...productData }
                    : p));
                toast.success('Produto atualizado com sucesso!');
            }
        }
        catch {
            toast.error('Erro ao salvar produto');
        }
    };
    const handleConfirmDelete = async () => {
        if (!productToDelete)
            return;
        setActionLoading(true);
        try {
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 1000));
            setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
            toast.success('Produto excluído com sucesso!');
            setIsConfirmDialogOpen(false);
            setProductToDelete(null);
        }
        catch {
            toast.error('Erro ao excluir produto');
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleCloseModals = () => {
        setIsProductModalOpen(false);
        setIsConfirmDialogOpen(false);
        setSelectedProduct(null);
        setProductToDelete(null);
    };
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Produtos" }), _jsx("p", { className: "text-gray-600", children: "Gerencie seu cat\u00E1logo de produtos" })] }), _jsxs(Button, { onClick: handleNewProduct, children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Novo Produto"] })] }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), _jsx(Input, { placeholder: "Buscar produtos...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }) }), _jsx("div", { className: "sm:w-48", children: _jsx("select", { value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", children: categories.map(category => (_jsx("option", { value: category, children: category === 'all' ? 'Todas as Categorias' : category }, category))) }) })] }) }) }), filteredProducts.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(Package, { className: "mx-auto h-12 w-12 text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Nenhum produto encontrado" }), _jsx("p", { className: "text-gray-600", children: "Tente ajustar os filtros ou adicione um novo produto." })] }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredProducts.map((product) => (_jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx(CardTitle, { className: "text-lg", children: product.name }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: product.description })] }), _jsxs("div", { className: "flex gap-1 ml-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleEdit(product.id), children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDelete(product.id), children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }) }), _jsx(CardContent, { className: "pt-0", children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Categoria:" }), _jsx("span", { className: "text-sm font-medium", children: product.category })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Pre\u00E7o:" }), _jsx("span", { className: "text-lg font-bold text-primary", children: formatCurrency(product.price) })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Estoque:" }), _jsxs("span", { className: `text-sm font-medium ${product.stock > 10 ? 'text-green-600' :
                                                    product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`, children: [product.stock, " unidades"] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Status:" }), _jsx("span", { className: `inline-flex px-2 py-1 rounded-full text-xs font-medium ${product.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'}`, children: product.status === 'active' ? 'Ativo' : 'Inativo' })] })] }) })] }, product.id))) })), _jsx(ProductModal, { isOpen: isProductModalOpen, onClose: handleCloseModals, onSave: handleSaveProduct, product: selectedProduct, mode: modalMode }), _jsx(ConfirmDialog, { isOpen: isConfirmDialogOpen, onClose: handleCloseModals, onConfirm: handleConfirmDelete, title: "Excluir Produto", description: `Tem certeza que deseja excluir o produto "${productToDelete?.name}"? Esta ação não pode ser desfeita.`, confirmText: "Excluir", cancelText: "Cancelar", variant: "danger", loading: actionLoading })] }));
}
