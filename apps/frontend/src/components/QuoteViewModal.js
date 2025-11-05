import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/Dialog';
export function QuoteViewModal({ isOpen, onClose, quote }) {
    if (!quote)
        return null;
    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'text-green-600 bg-green-100';
            case 'rejected':
                return 'text-red-600 bg-red-100';
            case 'expired':
                return 'text-gray-600 bg-gray-100';
            default:
                return 'text-yellow-600 bg-yellow-100';
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case 'approved':
                return 'Aprovado';
            case 'rejected':
                return 'Rejeitado';
            case 'expired':
                return 'Expirado';
            default:
                return 'Pendente';
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "sm:max-w-[600px]", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center justify-between", children: [_jsx("span", { children: "Detalhes do Or\u00E7amento" }), _jsx("span", { className: `px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`, children: getStatusText(quote.status) })] }), _jsxs(DialogDescription, { children: ["Or\u00E7amento #", quote.number] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Cliente" }), _jsx("p", { className: "text-gray-700", children: quote.client })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Descri\u00E7\u00E3o do Servi\u00E7o" }), _jsx("div", { className: "bg-gray-50 p-4 rounded-lg", children: _jsx("p", { className: "text-gray-700 whitespace-pre-wrap", children: quote.description }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Valor" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: formatCurrency(quote.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "V\u00E1lido at\u00E9" }), _jsx("p", { className: "text-gray-700", children: formatDate(quote.validUntil) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Data de Cria\u00E7\u00E3o" }), _jsx("p", { className: "text-gray-700", children: formatDate(quote.createdAt) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Status" }), _jsx("span", { className: `inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`, children: getStatusText(quote.status) })] })] }), quote.status === 'pending' && new Date(quote.validUntil) < new Date() && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "Or\u00E7amento Expirado" }), _jsx("div", { className: "mt-2 text-sm text-red-700", children: _jsxs("p", { children: ["Este or\u00E7amento expirou em ", formatDate(quote.validUntil), "."] }) })] })] }) }))] }), _jsx(DialogFooter, { children: _jsx(Button, { onClick: onClose, children: "Fechar" }) })] }) }));
}
