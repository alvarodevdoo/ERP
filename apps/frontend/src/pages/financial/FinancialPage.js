import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, DollarSign, Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { FinancialEntryModal } from '@/components/FinancialEntryModal';
import { FinancialEntryViewModal } from '@/components/FinancialEntryViewModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
export function FinancialPage() {
    const [entries, setEntries] = useState([]);
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        pendingReceivables: 0,
        pendingPayables: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    // Estados dos modais
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [entryToDelete, setEntryToDelete] = useState(null);
    const [defaultEntryType, setDefaultEntryType] = useState('income');
    const [actionLoading, setActionLoading] = useState(false);
    useEffect(() => {
        // Simular carregamento de dados financeiros
        const loadFinancialData = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockEntries = [
                {
                    id: '1',
                    description: 'Venda de produtos - Cliente A',
                    type: 'income',
                    category: 'Vendas',
                    amount: 2500.00,
                    date: '2024-01-15',
                    status: 'paid',
                    paymentMethod: 'Cartão de Crédito',
                    reference: 'OS-2024-001'
                },
                {
                    id: '2',
                    description: 'Pagamento de fornecedor - Matéria Prima',
                    type: 'expense',
                    category: 'Compras',
                    amount: 1200.00,
                    date: '2024-01-18',
                    dueDate: '2024-01-20',
                    status: 'pending',
                    reference: 'NF-12345'
                },
                {
                    id: '3',
                    description: 'Serviço de manutenção - Cliente B',
                    type: 'income',
                    category: 'Serviços',
                    amount: 800.00,
                    date: '2024-01-20',
                    dueDate: '2024-02-05',
                    status: 'pending',
                    reference: 'OS-2024-002'
                },
                {
                    id: '4',
                    description: 'Aluguel do galpão',
                    type: 'expense',
                    category: 'Despesas Fixas',
                    amount: 3500.00,
                    date: '2024-01-01',
                    status: 'paid',
                    paymentMethod: 'Transferência Bancária'
                },
                {
                    id: '5',
                    description: 'Conta de energia elétrica',
                    type: 'expense',
                    category: 'Utilidades',
                    amount: 450.00,
                    date: '2024-01-10',
                    dueDate: '2024-01-25',
                    status: 'overdue'
                }
            ];
            setEntries(mockEntries);
            // Calcular estatísticas
            const totalIncome = mockEntries
                .filter(entry => entry.type === 'income' && entry.status === 'paid')
                .reduce((sum, entry) => sum + entry.amount, 0);
            const totalExpenses = mockEntries
                .filter(entry => entry.type === 'expense' && entry.status === 'paid')
                .reduce((sum, entry) => sum + entry.amount, 0);
            const pendingReceivables = mockEntries
                .filter(entry => entry.type === 'income' && entry.status === 'pending')
                .reduce((sum, entry) => sum + entry.amount, 0);
            const pendingPayables = mockEntries
                .filter(entry => entry.type === 'expense' && (entry.status === 'pending' || entry.status === 'overdue'))
                .reduce((sum, entry) => sum + entry.amount, 0);
            const balance = totalIncome - totalExpenses;
            setStats({
                totalIncome,
                totalExpenses,
                balance,
                pendingReceivables,
                pendingPayables
            });
            setLoading(false);
        };
        loadFinancialData();
    }, []);
    const filteredEntries = entries.filter(entry => {
        const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (entry.reference && entry.reference.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = selectedType === 'all' || entry.type === selectedType;
        const matchesStatus = selectedStatus === 'all' || entry.status === selectedStatus;
        const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
        return matchesSearch && matchesType && matchesStatus && matchesCategory;
    });
    const categories = ['all', ...Array.from(new Set(entries.map(entry => entry.category)))];
    const typeOptions = [
        { value: 'all', label: 'Todos os Tipos' },
        { value: 'income', label: 'Receitas' },
        { value: 'expense', label: 'Despesas' }
    ];
    const statusOptions = [
        { value: 'all', label: 'Todos os Status' },
        { value: 'paid', label: 'Pago' },
        { value: 'pending', label: 'Pendente' },
        { value: 'overdue', label: 'Vencido' },
        { value: 'cancelled', label: 'Cancelado' }
    ];
    const getStatusColor = (status) => {
        const colors = {
            paid: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            overdue: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800'
        };
        return colors[status];
    };
    const getStatusLabel = (status) => {
        const labels = {
            paid: 'Pago',
            pending: 'Pendente',
            overdue: 'Vencido',
            cancelled: 'Cancelado'
        };
        return labels[status];
    };
    const getTypeColor = (type) => {
        return type === 'income' ? 'text-green-600' : 'text-red-600';
    };
    // Handlers dos modais
    const handleNewIncome = () => {
        setDefaultEntryType('income');
        setModalMode('create');
        setSelectedEntry(null);
        setIsEntryModalOpen(true);
    };
    const handleNewExpense = () => {
        setDefaultEntryType('expense');
        setModalMode('create');
        setSelectedEntry(null);
        setIsEntryModalOpen(true);
    };
    const handleView = (entryId) => {
        const entry = entries.find(e => e.id === entryId);
        if (entry) {
            setSelectedEntry(entry);
            setIsViewModalOpen(true);
        }
    };
    const handleEdit = (entryId) => {
        const entry = entries.find(e => e.id === entryId);
        if (entry) {
            setSelectedEntry(entry);
            setModalMode('edit');
            setIsEntryModalOpen(true);
        }
    };
    const handleDelete = (entryId) => {
        const entry = entries.find(e => e.id === entryId);
        if (entry) {
            setEntryToDelete(entry);
            setIsConfirmDialogOpen(true);
        }
    };
    const handleSaveEntry = async (entryData) => {
        setActionLoading(true);
        try {
            // Simular salvamento
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (modalMode === 'create') {
                const newEntry = {
                    ...entryData,
                    id: Date.now().toString()
                };
                setEntries(prev => [...prev, newEntry]);
                toast.success('Lançamento criado com sucesso!');
            }
            else {
                setEntries(prev => prev.map(entry => entry.id === selectedEntry?.id
                    ? { ...entryData, id: entry.id }
                    : entry));
                toast.success('Lançamento atualizado com sucesso!');
            }
            handleCloseModals();
        }
        catch {
            toast.error('Erro ao salvar lançamento');
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleConfirmDelete = async () => {
        if (!entryToDelete)
            return;
        setActionLoading(true);
        try {
            // Simular exclusão
            await new Promise(resolve => setTimeout(resolve, 1000));
            setEntries(prev => prev.filter(entry => entry.id !== entryToDelete.id));
            toast.success('Lançamento excluído com sucesso!');
            handleCloseModals();
        }
        catch {
            toast.error('Erro ao excluir lançamento');
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleCloseModals = () => {
        setIsEntryModalOpen(false);
        setIsViewModalOpen(false);
        setIsConfirmDialogOpen(false);
        setSelectedEntry(null);
        setEntryToDelete(null);
        setActionLoading(false);
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Financeiro" }), _jsx("p", { className: "text-gray-600", children: "Controle suas receitas e despesas" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", onClick: handleNewIncome, children: [_jsx(TrendingUp, { className: "mr-2 h-4 w-4" }), "Nova Receita"] }), _jsxs(Button, { variant: "outline", onClick: handleNewExpense, children: [_jsx(TrendingDown, { className: "mr-2 h-4 w-4" }), "Nova Despesa"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Receitas" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: formatCurrency(stats.totalIncome) })] }), _jsx(TrendingUp, { className: "h-8 w-8 text-green-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Despesas" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: formatCurrency(stats.totalExpenses) })] }), _jsx(TrendingDown, { className: "h-8 w-8 text-red-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Saldo" }), _jsx("p", { className: `text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`, children: formatCurrency(stats.balance) })] }), _jsx(DollarSign, { className: `h-8 w-8 ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}` })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "A Receber" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: formatCurrency(stats.pendingReceivables) })] }), _jsx(TrendingUp, { className: "h-8 w-8 text-blue-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "A Pagar" }), _jsx("p", { className: "text-2xl font-bold text-orange-600", children: formatCurrency(stats.pendingPayables) })] }), _jsx(TrendingDown, { className: "h-8 w-8 text-orange-600" })] }) }) })] }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col lg:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), _jsx(Input, { placeholder: "Buscar lan\u00E7amentos...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }) }), _jsx("div", { className: "sm:w-40", children: _jsx("select", { value: selectedType, onChange: (e) => setSelectedType(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", children: typeOptions.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value))) }) }), _jsx("div", { className: "sm:w-40", children: _jsx("select", { value: selectedStatus, onChange: (e) => setSelectedStatus(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", children: statusOptions.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value))) }) }), _jsx("div", { className: "sm:w-48", children: _jsx("select", { value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", children: categories.map(category => (_jsx("option", { value: category, children: category === 'all' ? 'Todas as Categorias' : category }, category))) }) })] }) }) }), filteredEntries.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(DollarSign, { className: "mx-auto h-12 w-12 text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Nenhum lan\u00E7amento encontrado" }), _jsx("p", { className: "text-gray-600", children: "Tente ajustar os filtros ou adicione um novo lan\u00E7amento." })] }) })) : (_jsx("div", { className: "space-y-4", children: filteredEntries.map((entry) => (_jsx(Card, { className: "hover:shadow-lg transition-shadow", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex-1 space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: entry.description }), _jsx("span", { className: `inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`, children: getStatusLabel(entry.status) }), entry.reference && (_jsx("span", { className: "text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded", children: entry.reference }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Tipo: " }), _jsx("span", { className: `font-medium ${getTypeColor(entry.type)}`, children: entry.type === 'income' ? 'Receita' : 'Despesa' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Categoria: " }), _jsx("span", { className: "font-medium", children: entry.category })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Valor: " }), _jsxs("span", { className: `font-bold text-lg ${getTypeColor(entry.type)}`, children: [entry.type === 'income' ? '+' : '-', formatCurrency(entry.amount)] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "h-4 w-4 text-gray-400" }), _jsx("span", { className: "text-gray-600", children: "Data: " }), _jsx("span", { className: "font-medium", children: formatDate(entry.date) })] }), entry.dueDate && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "h-4 w-4 text-gray-400" }), _jsx("span", { className: "text-gray-600", children: "Vencimento: " }), _jsx("span", { className: "font-medium", children: formatDate(entry.dueDate) })] })), entry.paymentMethod && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Forma de Pagamento: " }), _jsx("span", { className: "font-medium", children: entry.paymentMethod })] }))] }), entry.notes && (_jsx("p", { className: "text-gray-600 text-sm", children: entry.notes }))] }), _jsxs("div", { className: "flex gap-2 lg:flex-col", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleView(entry.id), children: [_jsx(Eye, { className: "h-4 w-4 mr-1" }), "Ver"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleEdit(entry.id), children: [_jsx(Edit, { className: "h-4 w-4 mr-1" }), "Editar"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleDelete(entry.id), children: [_jsx(Trash2, { className: "h-4 w-4 mr-1" }), "Excluir"] })] })] }) }) }, entry.id))) })), _jsx(FinancialEntryModal, { isOpen: isEntryModalOpen, onClose: handleCloseModals, onSave: handleSaveEntry, entry: selectedEntry, mode: modalMode, defaultType: defaultEntryType }), _jsx(FinancialEntryViewModal, { isOpen: isViewModalOpen, onClose: handleCloseModals, entry: selectedEntry }), _jsx(ConfirmDialog, { isOpen: isConfirmDialogOpen, onClose: handleCloseModals, onConfirm: handleConfirmDelete, title: "Excluir Lan\u00E7amento", description: `Tem certeza que deseja excluir o lançamento "${entryToDelete?.description || 'selecionado'}"? Esta ação não pode ser desfeita.`, confirmText: "Excluir", variant: "danger", loading: actionLoading })] }));
}
