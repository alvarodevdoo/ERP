import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X, User, Calendar, Phone, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
export function OrderViewModal({ isOpen, onClose, order }) {
    if (!isOpen || !order)
        return null;
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };
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
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs(Card, { className: "w-full max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-4", children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(ClipboardList, { className: "h-5 w-5" }), "Detalhes da Ordem de Servi\u00E7o"] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-gray-900", children: order.number }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Criada em ", formatDate(order.createdAt)] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("span", { className: `inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`, children: getStatusLabel(order.status) }), _jsxs("span", { className: `inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(order.priority)}`, children: ["Prioridade ", getPriorityLabel(order.priority)] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-3", children: "Informa\u00E7\u00F5es do Cliente" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(User, { className: "h-4 w-4 text-gray-400" }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-600", children: "Nome:" }), _jsx("p", { className: "font-medium", children: order.customerName })] })] }), order.customerPhone && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Phone, { className: "h-4 w-4 text-gray-400" }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-600", children: "Telefone:" }), _jsx("p", { className: "font-medium", children: order.customerPhone })] })] }))] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-3", children: "Descri\u00E7\u00E3o do Servi\u00E7o" }), _jsx("div", { className: "p-4 bg-gray-50 rounded-lg", children: _jsx("p", { className: "text-gray-700 whitespace-pre-wrap", children: order.description }) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-3", children: "Informa\u00E7\u00F5es do Servi\u00E7o" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-600", children: "Respons\u00E1vel:" }), _jsxs("p", { className: "font-medium flex items-center gap-1", children: [_jsx(User, { className: "h-4 w-4 text-gray-400" }), order.assignedTo] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-600", children: "Data de Entrega Estimada:" }), _jsxs("p", { className: "font-medium flex items-center gap-1", children: [_jsx(Calendar, { className: "h-4 w-4 text-gray-400" }), formatDate(order.estimatedDelivery)] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-600", children: "Valor Total:" }), _jsx("p", { className: "font-bold text-primary text-lg", children: formatCurrency(order.totalValue) })] })] })] }), _jsx("div", { className: "flex justify-end pt-4", children: _jsx(Button, { onClick: onClose, children: "Fechar" }) })] })] }) }));
}
