import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, ClipboardList, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { OrderModal } from '@/components/OrderModal';
import { OrderViewModal } from '@/components/OrderViewModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
export function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    // Estados para modais
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    useEffect(() => {
        // Simular carregamento de ordens de serviço
        const loadOrders = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockOrders = [
                {
                    id: '1',
                    number: 'OS-2024-001',
                    customerName: 'Ana Costa',
                    customerPhone: '(11) 99999-9999',
                    description: 'Reparo em produto personalizado',
                    priority: 'high',
                    status: 'in_progress',
                    assignedTo: 'João Técnico',
                    estimatedDelivery: '2024-02-10',
                    totalValue: 350.00,
                    createdAt: '2024-01-15'
                },
                {
                    id: '2',
                    number: 'OS-2024-002',
                    customerName: 'Carlos Silva',
                    customerPhone: '(11) 88888-8888',
                    description: 'Manutenção preventiva',
                    priority: 'medium',
                    status: 'pending',
                    assignedTo: 'Maria Técnica',
                    estimatedDelivery: '2024-02-15',
                    totalValue: 200.00,
                    createdAt: '2024-01-18'
                },
                {
                    id: '3',
                    number: 'OS-2024-003',
                    customerName: 'Lucia Santos',
                    customerPhone: '(11) 77777-7777',
                    description: 'Instalação de equipamento',
                    priority: 'urgent',
                    status: 'waiting_approval',
                    assignedTo: 'Pedro Técnico',
                    estimatedDelivery: '2024-02-08',
                    totalValue: 800.00,
                    createdAt: '2024-01-20'
                }
            ];
            setOrders(mockOrders);
            setLoading(false);
        };
        loadOrders();
    }, []);
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
        const matchesPriority = selectedPriority === 'all' || order.priority === selectedPriority;
        return matchesSearch && matchesStatus && matchesPriority;
    });
    const statusOptions = [
        { value: 'all', label: 'Todos os Status' },
        { value: 'pending', label: 'Pendente' },
        { value: 'in_progress', label: 'Em Andamento' },
        { value: 'waiting_approval', label: 'Aguardando Aprovação' },
        { value: 'completed', label: 'Concluída' },
        { value: 'cancelled', label: 'Cancelada' }
    ];
    const priorityOptions = [
        { value: 'all', label: 'Todas as Prioridades' },
        { value: 'low', label: 'Baixa' },
        { value: 'medium', label: 'Média' },
        { value: 'high', label: 'Alta' },
        { value: 'urgent', label: 'Urgente' }
    ];
    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            in_progress: 'bg-blue-100 text-blue-800',
            waiting_approval: 'bg-orange-100 text-orange-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status];
    };
    const getPriorityColor = (priority) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-blue-100 text-blue-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800'
        };
        return colors[priority];
    };
    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Pendente',
            in_progress: 'Em Andamento',
            waiting_approval: 'Aguardando Aprovação',
            completed: 'Concluída',
            cancelled: 'Cancelada'
        };
        return labels[status];
    };
    const getPriorityLabel = (priority) => {
        const labels = {
            low: 'Baixa',
            medium: 'Média',
            high: 'Alta',
            urgent: 'Urgente'
        };
        return labels[priority];
    };
    // Handlers para modais
    const handleNewOrder = () => {
        setModalMode('create');
        setSelectedOrder(null);
        setIsOrderModalOpen(true);
    };
    const handleView = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            setSelectedOrder(order);
            setIsViewModalOpen(true);
        }
    };
    const handleEdit = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            setModalMode('edit');
            setSelectedOrder(order);
            setIsOrderModalOpen(true);
        }
    };
    const handleDelete = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            setOrderToDelete(order);
            setIsConfirmDialogOpen(true);
        }
    };
    const handleSaveOrder = async (orderData) => {
        setActionLoading(true);
        try {
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (modalMode === 'create') {
                // Criar nova OS
                const newOrder = {
                    id: Date.now().toString(),
                    number: `OS-2024-${String(orders.length + 1).padStart(3, '0')}`,
                    status: 'pending',
                    createdAt: new Date().toISOString().split('T')[0],
                    ...orderData
                };
                setOrders(prev => [newOrder, ...prev]);
                toast.success('Ordem de serviço criada com sucesso!');
            }
            else {
                // Editar OS existente
                setOrders(prev => prev.map(order => order.id === selectedOrder?.id
                    ? { ...order, ...orderData }
                    : order));
                toast.success('Ordem de serviço atualizada com sucesso!');
            }
            handleCloseModals();
        }
        catch {
            toast.error('Erro ao salvar ordem de serviço');
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleConfirmDelete = async () => {
        if (!orderToDelete)
            return;
        setActionLoading(true);
        try {
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 1000));
            setOrders(prev => prev.filter(order => order.id !== orderToDelete.id));
            toast.success('Ordem de serviço excluída com sucesso!');
            handleCloseModals();
        }
        catch {
            toast.error('Erro ao excluir ordem de serviço');
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleCloseModals = () => {
        setIsOrderModalOpen(false);
        setIsViewModalOpen(false);
        setIsConfirmDialogOpen(false);
        setSelectedOrder(null);
        setOrderToDelete(null);
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Ordens de Servi\u00E7o" }), _jsx("p", { className: "text-gray-600", children: "Gerencie suas ordens de servi\u00E7o e atendimentos" })] }), _jsxs(Button, { onClick: handleNewOrder, children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Nova OS"] })] }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col lg:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), _jsx(Input, { placeholder: "Buscar ordens de servi\u00E7o...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }) }), _jsx("div", { className: "sm:w-48", children: _jsx("select", { value: selectedStatus, onChange: (e) => setSelectedStatus(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", children: statusOptions.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value))) }) }), _jsx("div", { className: "sm:w-48", children: _jsx("select", { value: selectedPriority, onChange: (e) => setSelectedPriority(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", children: priorityOptions.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value))) }) })] }) }) }), filteredOrders.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(ClipboardList, { className: "mx-auto h-12 w-12 text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Nenhuma OS encontrada" }), _jsx("p", { className: "text-gray-600", children: "Tente ajustar os filtros ou crie uma nova ordem de servi\u00E7o." })] }) })) : (_jsx("div", { className: "space-y-4", children: filteredOrders.map((order) => (_jsx(Card, { className: "hover:shadow-lg transition-shadow", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex-1 space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: order.number }), _jsx("span", { className: `inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`, children: getStatusLabel(order.status) }), _jsx("span", { className: `inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`, children: getPriorityLabel(order.priority) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Cliente: " }), _jsx("span", { className: "font-medium", children: order.customerName })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Telefone: " }), _jsx("span", { className: "font-medium", children: order.customerPhone })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(User, { className: "h-4 w-4 text-gray-400" }), _jsx("span", { className: "text-gray-600", children: "Respons\u00E1vel: " }), _jsx("span", { className: "font-medium", children: order.assignedTo })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Valor: " }), _jsx("span", { className: "font-bold text-primary", children: formatCurrency(order.totalValue) })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "h-4 w-4 text-gray-400" }), _jsx("span", { className: "text-gray-600", children: "Entrega: " }), _jsx("span", { className: "font-medium", children: formatDate(order.estimatedDelivery) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Criada em: " }), _jsx("span", { className: "font-medium", children: formatDate(order.createdAt) })] })] }), _jsx("p", { className: "text-gray-600 text-sm", children: order.description })] }), _jsxs("div", { className: "flex gap-2 lg:flex-col", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleView(order.id), children: [_jsx(Eye, { className: "h-4 w-4 mr-1" }), "Ver"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleEdit(order.id), children: [_jsx(Edit, { className: "h-4 w-4 mr-1" }), "Editar"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleDelete(order.id), children: [_jsx(Trash2, { className: "h-4 w-4 mr-1" }), "Excluir"] })] })] }) }) }, order.id))) })), _jsx(OrderModal, { isOpen: isOrderModalOpen, onClose: handleCloseModals, onSave: handleSaveOrder, order: selectedOrder, mode: modalMode }), _jsx(OrderViewModal, { isOpen: isViewModalOpen, onClose: handleCloseModals, order: selectedOrder }), _jsx(ConfirmDialog, { isOpen: isConfirmDialogOpen, onClose: handleCloseModals, onConfirm: handleConfirmDelete, title: "Excluir Ordem de Servi\u00E7o", description: `Tem certeza que deseja excluir a ordem de serviço ${orderToDelete?.number}? Esta ação não pode ser desfeita.`, confirmText: "Excluir", variant: "danger", loading: actionLoading })] }));
}
