import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Plus, Search, TrendingUp, TrendingDown, Package, AlertTriangle, Eye, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { StockItemModal } from '@/components/StockItemModal';
import { StockItemViewModal } from '@/components/StockItemViewModal';
import { StockMovementModal } from '@/components/StockMovementModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
export function StockPage() {
    const [stockItems, setStockItems] = useState([]);
    const [stats, setStats] = useState({ totalItems: 0, totalValue: 0, lowStockItems: 0, outOfStockItems: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    // Estados para modais
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [movementType, setMovementType] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    useEffect(() => {
        // Simular carregamento de estoque
        const loadStock = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockStockItems = [
                {
                    id: '1',
                    productName: 'Produto A',
                    sku: 'PRD-A-001',
                    category: 'Categoria 1',
                    currentStock: 45,
                    minStock: 10,
                    maxStock: 100,
                    unitCost: 25.50,
                    totalValue: 1147.50,
                    location: 'Estoque Principal - A1',
                    lastMovement: {
                        type: 'out',
                        quantity: 5,
                        date: '2024-01-20',
                        reason: 'Venda'
                    }
                },
                {
                    id: '2',
                    productName: 'Produto B',
                    sku: 'PRD-B-002',
                    category: 'Categoria 2',
                    currentStock: 8,
                    minStock: 15,
                    maxStock: 80,
                    unitCost: 42.00,
                    totalValue: 336.00,
                    location: 'Estoque Principal - B2',
                    lastMovement: {
                        type: 'in',
                        quantity: 20,
                        date: '2024-01-18',
                        reason: 'Compra'
                    }
                },
                {
                    id: '3',
                    productName: 'Produto C',
                    sku: 'PRD-C-003',
                    category: 'Categoria 1',
                    currentStock: 0,
                    minStock: 5,
                    maxStock: 50,
                    unitCost: 18.75,
                    totalValue: 0,
                    location: 'Estoque Principal - C1',
                    lastMovement: {
                        type: 'out',
                        quantity: 3,
                        date: '2024-01-15',
                        reason: 'Ordem de Serviço'
                    }
                },
                {
                    id: '4',
                    productName: 'Produto D',
                    sku: 'PRD-D-004',
                    category: 'Categoria 3',
                    currentStock: 75,
                    minStock: 20,
                    maxStock: 120,
                    unitCost: 35.25,
                    totalValue: 2643.75,
                    location: 'Estoque Secundário - D1',
                    lastMovement: {
                        type: 'in',
                        quantity: 25,
                        date: '2024-01-19',
                        reason: 'Transferência'
                    }
                }
            ];
            setStockItems(mockStockItems);
            // Calcular estatísticas
            const totalItems = mockStockItems.length;
            const totalValue = mockStockItems.reduce((sum, item) => sum + item.totalValue, 0);
            const lowStockItems = mockStockItems.filter(item => item.currentStock > 0 && item.currentStock <= item.minStock).length;
            const outOfStockItems = mockStockItems.filter(item => item.currentStock === 0).length;
            setStats({ totalItems, totalValue, lowStockItems, outOfStockItems });
            setLoading(false);
        };
        loadStock();
    }, []);
    const filteredItems = stockItems.filter(item => {
        const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        let matchesStockFilter = true;
        if (stockFilter === 'low') {
            matchesStockFilter = item.currentStock > 0 && item.currentStock <= item.minStock;
        }
        else if (stockFilter === 'out') {
            matchesStockFilter = item.currentStock === 0;
        }
        else if (stockFilter === 'normal') {
            matchesStockFilter = item.currentStock > item.minStock;
        }
        return matchesSearch && matchesCategory && matchesStockFilter;
    });
    const categories = ['all', ...Array.from(new Set(stockItems.map(item => item.category)))];
    const stockFilterOptions = [
        { value: 'all', label: 'Todos os Itens' },
        { value: 'normal', label: 'Estoque Normal' },
        { value: 'low', label: 'Estoque Baixo' },
        { value: 'out', label: 'Sem Estoque' }
    ];
    const getStockStatus = (item) => {
        if (item.currentStock === 0) {
            return { status: 'out', color: 'text-red-600', bgColor: 'bg-red-100', label: 'Sem Estoque' };
        }
        else if (item.currentStock <= item.minStock) {
            return { status: 'low', color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Estoque Baixo' };
        }
        else {
            return { status: 'normal', color: 'text-green-600', bgColor: 'bg-green-100', label: 'Normal' };
        }
    };
    // Handlers para modais
    const handleNewItem = () => {
        setModalMode('create');
        setSelectedItem(null);
        setIsItemModalOpen(true);
    };
    const handleView = (itemId) => {
        const item = stockItems.find(p => p.id === itemId);
        if (item) {
            setSelectedItem(item);
            setIsViewModalOpen(true);
        }
    };
    const handleEdit = (itemId) => {
        const item = stockItems.find(p => p.id === itemId);
        if (item) {
            setSelectedItem(item);
            setModalMode('edit');
            setIsItemModalOpen(true);
        }
    };
    const handleMovement = (itemId) => {
        const item = stockItems.find(p => p.id === itemId);
        if (item) {
            setSelectedItem(item);
            setMovementType(null);
            setIsMovementModalOpen(true);
        }
    };
    const handleEntryMovement = () => {
        setMovementType('in');
        setSelectedItem(null);
        setIsMovementModalOpen(true);
    };
    const handleExitMovement = () => {
        setMovementType('out');
        setSelectedItem(null);
        setIsMovementModalOpen(true);
    };
    const handleSaveItem = async (itemData) => {
        setActionLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (modalMode === 'create') {
                const newItem = {
                    id: Date.now().toString(),
                    ...itemData,
                    lastMovement: {
                        type: 'in',
                        quantity: itemData.currentStock || 0,
                        date: new Date().toISOString().split('T')[0],
                        reason: 'Cadastro inicial'
                    }
                };
                setStockItems(prev => [...prev, newItem]);
                toast.success('Item criado com sucesso!');
            }
            else {
                setStockItems(prev => prev.map(item => item.id === selectedItem?.id
                    ? { ...item, ...itemData }
                    : item));
                toast.success('Item atualizado com sucesso!');
            }
            handleCloseModals();
        }
        catch {
            toast.error('Erro ao salvar item');
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleSaveMovement = async (movementData) => {
        setActionLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (selectedItem) {
                const newStock = movementData.type === 'in'
                    ? selectedItem.currentStock + movementData.quantity
                    : selectedItem.currentStock - movementData.quantity;
                const newTotalValue = newStock * selectedItem.unitCost;
                setStockItems(prev => prev.map(item => item.id === selectedItem.id
                    ? {
                        ...item,
                        currentStock: newStock,
                        totalValue: newTotalValue,
                        lastMovement: {
                            ...movementData,
                            date: movementData.date || new Date().toISOString().split('T')[0],
                            reason: movementData.reason || 'Movimentação'
                        }
                    }
                    : item));
                toast.success(`${movementData.type === 'in' ? 'Entrada' : 'Saída'} registrada com sucesso!`);
            }
            handleCloseModals();
        }
        catch {
            toast.error('Erro ao registrar movimentação');
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleConfirmDelete = async () => {
        if (!itemToDelete)
            return;
        setActionLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setStockItems(prev => prev.filter(item => item.id !== itemToDelete.id));
            toast.success('Item excluído com sucesso!');
            handleCloseModals();
        }
        catch {
            toast.error('Erro ao excluir item');
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleCloseModals = () => {
        setIsItemModalOpen(false);
        setIsViewModalOpen(false);
        setIsMovementModalOpen(false);
        setIsConfirmDialogOpen(false);
        setSelectedItem(null);
        setItemToDelete(null);
        setMovementType(null);
    };
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Controle de Estoque" }), _jsx("p", { className: "text-gray-600", children: "Gerencie seu invent\u00E1rio e movimenta\u00E7\u00F5es" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", onClick: handleEntryMovement, children: [_jsx(TrendingUp, { className: "mr-2 h-4 w-4" }), "Entrada"] }), _jsxs(Button, { variant: "outline", onClick: handleExitMovement, children: [_jsx(TrendingDown, { className: "mr-2 h-4 w-4" }), "Sa\u00EDda"] }), _jsxs(Button, { onClick: handleNewItem, children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Novo Item"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total de Itens" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: stats.totalItems })] }), _jsx(Package, { className: "h-8 w-8 text-blue-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Valor Total" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: formatCurrency(stats.totalValue) })] }), _jsx(TrendingUp, { className: "h-8 w-8 text-green-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Estoque Baixo" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600", children: stats.lowStockItems })] }), _jsx(AlertTriangle, { className: "h-8 w-8 text-yellow-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Sem Estoque" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: stats.outOfStockItems })] }), _jsx(Package, { className: "h-8 w-8 text-red-600" })] }) }) })] }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col lg:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), _jsx(Input, { placeholder: "Buscar produtos...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }) }), _jsx("div", { className: "sm:w-48", children: _jsx("select", { value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", children: categories.map(category => (_jsx("option", { value: category, children: category === 'all' ? 'Todas as Categorias' : category }, category))) }) }), _jsx("div", { className: "sm:w-48", children: _jsx("select", { value: stockFilter, onChange: (e) => setStockFilter(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", children: stockFilterOptions.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value))) }) })] }) }) }), filteredItems.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(Package, { className: "mx-auto h-12 w-12 text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Nenhum item encontrado" }), _jsx("p", { className: "text-gray-600", children: "Tente ajustar os filtros ou adicione um novo item ao estoque." })] }) })) : (_jsx("div", { className: "space-y-4", children: filteredItems.map((item) => {
                    const stockStatus = getStockStatus(item);
                    return (_jsx(Card, { className: "hover:shadow-lg transition-shadow", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex-1 space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: item.productName }), _jsxs("span", { className: "text-sm text-gray-600", children: ["(", item.sku, ")"] }), _jsx("span", { className: `inline-flex px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`, children: stockStatus.label })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Categoria: " }), _jsx("span", { className: "font-medium", children: item.category })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Estoque Atual: " }), _jsxs("span", { className: `font-bold ${stockStatus.color}`, children: [item.currentStock, " un."] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Estoque M\u00EDn/M\u00E1x: " }), _jsxs("span", { className: "font-medium", children: [item.minStock, "/", item.maxStock] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Localiza\u00E7\u00E3o: " }), _jsx("span", { className: "font-medium", children: item.location })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Custo Unit\u00E1rio: " }), _jsx("span", { className: "font-medium", children: formatCurrency(item.unitCost) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Valor Total: " }), _jsx("span", { className: "font-bold text-primary", children: formatCurrency(item.totalValue) })] }), _jsxs("div", { className: "col-span-2", children: [_jsx("span", { className: "text-gray-600", children: "\u00DAltima Movimenta\u00E7\u00E3o: " }), _jsxs("span", { className: "font-medium", children: [item.lastMovement.type === 'in' ? 'Entrada' : 'Saída', " de ", item.lastMovement.quantity, " un. em ", formatDate(item.lastMovement.date || ''), " (", item.lastMovement.reason, ")"] })] })] })] }), _jsxs("div", { className: "flex gap-2 lg:flex-col", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleView(item.id), children: [_jsx(Eye, { className: "h-4 w-4 mr-1" }), "Ver"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleEdit(item.id), children: [_jsx(Edit, { className: "h-4 w-4 mr-1" }), "Editar"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleMovement(item.id), children: [_jsx(TrendingUp, { className: "h-4 w-4 mr-1" }), "Movimentar"] })] })] }) }) }, item.id));
                }) })), _jsx(StockItemModal, { isOpen: isItemModalOpen, onClose: handleCloseModals, onSave: handleSaveItem, item: selectedItem, mode: modalMode }), _jsx(StockItemViewModal, { isOpen: isViewModalOpen, onClose: handleCloseModals, item: selectedItem }), _jsx(StockMovementModal, { isOpen: isMovementModalOpen, onClose: handleCloseModals, onSave: handleSaveMovement, item: selectedItem, movementType: movementType }), _jsx(ConfirmDialog, { isOpen: isConfirmDialogOpen, onClose: handleCloseModals, onConfirm: handleConfirmDelete, title: "Excluir Item de Estoque", description: `Tem certeza que deseja excluir o item ${itemToDelete?.productName}? Esta ação não pode ser desfeita.`, confirmText: "Excluir", variant: "danger", loading: actionLoading })] }));
}
