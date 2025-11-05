import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { QuoteModal } from '@/components/QuoteModal';
import { QuoteViewModal } from '@/components/QuoteViewModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
export function QuotesPage() {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    // Estados para controlar os modais
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [quoteToDelete, setQuoteToDelete] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    useEffect(() => {
        // Simular carregamento de orçamentos
        const loadQuotes = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockQuotes = [
                {
                    id: '1',
                    number: 'ORC-2024-001',
                    client: 'João Silva',
                    description: 'Orçamento para produtos personalizados de alta qualidade',
                    value: 2500.00,
                    status: 'pending',
                    validUntil: '2024-02-15',
                    createdAt: '2024-01-15'
                },
                {
                    id: '2',
                    number: 'ORC-2024-002',
                    client: 'Maria Santos',
                    description: 'Orçamento para linha premium com acabamento especial',
                    value: 4200.00,
                    status: 'approved',
                    validUntil: '2024-02-20',
                    createdAt: '2024-01-18'
                },
                {
                    id: '3',
                    number: 'ORC-2024-003',
                    client: 'Pedro Costa',
                    description: 'Orçamento para revenda com desconto por volume',
                    value: 1800.00,
                    status: 'pending',
                    validUntil: '2024-02-25',
                    createdAt: '2024-01-20'
                }
            ];
            setQuotes(mockQuotes);
            setLoading(false);
        };
        loadQuotes();
    }, []);
    const filteredQuotes = quotes.filter(quote => {
        const matchesSearch = quote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || quote.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });
    const statusOptions = [
        { value: 'all', label: 'Todos os Status' },
        { value: 'pending', label: 'Pendente' },
        { value: 'approved', label: 'Aprovado' },
        { value: 'rejected', label: 'Rejeitado' },
        { value: 'expired', label: 'Expirado' }
    ];
    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            expired: 'bg-gray-100 text-gray-800'
        };
        return colors[status];
    };
    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Pendente',
            approved: 'Aprovado',
            rejected: 'Rejeitado',
            expired: 'Expirado'
        };
        return labels[status];
    };
    // Handlers para gerenciar os modais
    const handleNewQuote = () => {
        setModalMode('create');
        setSelectedQuote(null);
        setIsQuoteModalOpen(true);
    };
    const handleView = (quoteId) => {
        const quote = quotes.find(q => q.id === quoteId);
        if (quote) {
            setSelectedQuote(quote);
            setIsViewModalOpen(true);
        }
    };
    const handleEdit = (quoteId) => {
        const quote = quotes.find(q => q.id === quoteId);
        if (quote) {
            setModalMode('edit');
            setSelectedQuote(quote);
            setIsQuoteModalOpen(true);
        }
    };
    const handleDelete = (quoteId) => {
        const quote = quotes.find(q => q.id === quoteId);
        if (quote) {
            setQuoteToDelete(quote);
            setIsConfirmDialogOpen(true);
        }
    };
    const handleSaveQuote = async (quoteData) => {
        setActionLoading(true);
        try {
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (modalMode === 'create') {
                const newQuote = {
                    ...quoteData,
                    id: Date.now().toString(),
                    number: `ORC-2024-${String(quotes.length + 1).padStart(3, '0')}`,
                    createdAt: new Date().toISOString().split('T')[0]
                };
                setQuotes(prev => [...prev, newQuote]);
                toast.success('Orçamento criado com sucesso!');
            }
            else {
                setQuotes(prev => prev.map(quote => quote.id === selectedQuote?.id
                    ? { ...quote, ...quoteData }
                    : quote));
                toast.success('Orçamento atualizado com sucesso!');
            }
        }
        catch {
            toast.error('Erro ao salvar orçamento');
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleConfirmDelete = async () => {
        if (!quoteToDelete)
            return;
        setActionLoading(true);
        try {
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 1000));
            setQuotes(prev => prev.filter(quote => quote.id !== quoteToDelete.id));
            toast.success('Orçamento excluído com sucesso!');
            handleCloseModals();
        }
        catch {
            toast.error('Erro ao excluir orçamento');
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleCloseModals = () => {
        setIsQuoteModalOpen(false);
        setIsViewModalOpen(false);
        setIsConfirmDialogOpen(false);
        setSelectedQuote(null);
        setQuoteToDelete(null);
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Or\u00E7amentos" }), _jsx("p", { className: "text-gray-600", children: "Gerencie seus or\u00E7amentos e propostas" })] }), _jsxs(Button, { onClick: handleNewQuote, children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Novo Or\u00E7amento"] })] }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), _jsx(Input, { placeholder: "Buscar or\u00E7amentos...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }) }), _jsx("div", { className: "sm:w-48", children: _jsx("select", { value: selectedStatus, onChange: (e) => setSelectedStatus(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", children: statusOptions.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value))) }) })] }) }) }), filteredQuotes.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(FileText, { className: "mx-auto h-12 w-12 text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Nenhum or\u00E7amento encontrado" }), _jsx("p", { className: "text-gray-600", children: "Tente ajustar os filtros ou crie um novo or\u00E7amento." })] }) })) : (_jsx("div", { className: "space-y-4", children: filteredQuotes.map((quote) => (_jsx(Card, { className: "hover:shadow-lg transition-shadow", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex-1 space-y-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: quote.number }), _jsx("span", { className: `inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`, children: getStatusLabel(quote.status) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Cliente: " }), _jsx("span", { className: "font-medium", children: quote.client })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Valor Total: " }), _jsx("span", { className: "font-bold text-primary text-lg", children: formatCurrency(quote.value) })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "h-4 w-4 text-gray-400" }), _jsx("span", { className: "text-gray-600", children: "V\u00E1lido at\u00E9: " }), _jsx("span", { className: "font-medium", children: formatDate(quote.validUntil) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Criado em: " }), _jsx("span", { className: "font-medium", children: formatDate(quote.createdAt) })] })] }), _jsx("p", { className: "text-gray-600 text-sm", children: quote.description })] }), _jsxs("div", { className: "flex gap-2 lg:flex-col", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleView(quote.id), children: [_jsx(Eye, { className: "h-4 w-4 mr-1" }), "Ver"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleEdit(quote.id), children: [_jsx(Edit, { className: "h-4 w-4 mr-1" }), "Editar"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleDelete(quote.id), children: [_jsx(Trash2, { className: "h-4 w-4 mr-1" }), "Excluir"] })] })] }) }) }, quote.id))) })), _jsx(QuoteModal, { isOpen: isQuoteModalOpen, onClose: handleCloseModals, onSave: handleSaveQuote, quote: selectedQuote, mode: modalMode }), _jsx(QuoteViewModal, { isOpen: isViewModalOpen, onClose: handleCloseModals, quote: selectedQuote }), _jsx(ConfirmDialog, { isOpen: isConfirmDialogOpen, onClose: handleCloseModals, onConfirm: handleConfirmDelete, title: "Excluir Or\u00E7amento", description: `Tem certeza que deseja excluir o orçamento ${quoteToDelete?.number}? Esta ação não pode ser desfeita.`, confirmText: "Excluir", variant: "danger", loading: actionLoading })] }));
}
