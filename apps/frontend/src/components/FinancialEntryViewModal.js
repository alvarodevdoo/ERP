import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X, Calendar, DollarSign, FileText, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
export function FinancialEntryViewModal({ isOpen, onClose, entry }) {
    if (!isOpen || !entry)
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
    const getTypeLabel = (type) => {
        return type === 'income' ? 'Receita' : 'Despesa';
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Detalhes do Lan\u00E7amento" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2", children: "Informa\u00E7\u00F5es B\u00E1sicas" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Descri\u00E7\u00E3o" }), _jsx("p", { className: "text-gray-900 font-medium", children: entry.description })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Tipo" }), _jsx("p", { className: `font-medium ${getTypeColor(entry.type)}`, children: getTypeLabel(entry.type) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Categoria" }), _jsx("p", { className: "text-gray-900 font-medium", children: entry.category })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Status" }), _jsx("span", { className: `inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`, children: getStatusLabel(entry.status) })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2", children: "Informa\u00E7\u00F5es Financeiras" }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(DollarSign, { className: "h-5 w-5 text-gray-600" }), _jsx("span", { className: "text-sm font-medium text-gray-600", children: "Valor" })] }), _jsxs("p", { className: `text-2xl font-bold ${getTypeColor(entry.type)}`, children: [entry.type === 'income' ? '+' : '-', formatCurrency(entry.amount)] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Calendar, { className: "h-4 w-4 text-gray-600" }), _jsx("label", { className: "text-sm font-medium text-gray-600", children: "Data" })] }), _jsx("p", { className: "text-gray-900 font-medium", children: formatDate(entry.date) })] }), entry.dueDate && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Calendar, { className: "h-4 w-4 text-gray-600" }), _jsx("label", { className: "text-sm font-medium text-gray-600", children: "Data de Vencimento" })] }), _jsx("p", { className: "text-gray-900 font-medium", children: formatDate(entry.dueDate) })] })), entry.paymentMethod && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(CreditCard, { className: "h-4 w-4 text-gray-600" }), _jsx("label", { className: "text-sm font-medium text-gray-600", children: "Forma de Pagamento" })] }), _jsx("p", { className: "text-gray-900 font-medium", children: entry.paymentMethod })] })), entry.reference && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(FileText, { className: "h-4 w-4 text-gray-600" }), _jsx("label", { className: "text-sm font-medium text-gray-600", children: "Refer\u00EAncia" })] }), _jsx("p", { className: "text-gray-900 font-medium", children: entry.reference })] }))] })] }), entry.notes && (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 border-b pb-2", children: "Observa\u00E7\u00F5es" }), _jsx("div", { className: "bg-gray-50 p-4 rounded-lg", children: _jsx("p", { className: "text-gray-700", children: entry.notes }) })] }))] }), _jsx("div", { className: "flex justify-end p-6 border-t", children: _jsx(Button, { onClick: onClose, children: "Fechar" }) })] }) }));
}
