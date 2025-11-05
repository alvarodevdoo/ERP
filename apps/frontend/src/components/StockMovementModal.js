import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
export function StockMovementModal({ isOpen, onClose, onSave, item, movementType }) {
    const [formData, setFormData] = useState({
        type: 'in',
        quantity: 0,
        reason: '',
        date: new Date().toISOString().split('T')[0]
    });
    // Definir tipo de movimentação quando especificado
    useEffect(() => {
        if (movementType) {
            setFormData(prev => ({
                ...prev,
                type: movementType
            }));
        }
    }, [movementType]);
    // Limpar formulário quando abrir
    useEffect(() => {
        if (isOpen) {
            setFormData({
                type: movementType || 'in',
                quantity: 0,
                reason: '',
                date: new Date().toISOString().split('T')[0]
            });
        }
    }, [isOpen, movementType]);
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const reasonOptions = {
        in: [
            'Compra',
            'Transferência',
            'Devolução',
            'Ajuste de Inventário',
            'Produção',
            'Outros'
        ],
        out: [
            'Venda',
            'Ordem de Serviço',
            'Transferência',
            'Perda/Avaria',
            'Ajuste de Inventário',
            'Outros'
        ]
    };
    if (!isOpen || !item)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-md", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b", children: [_jsxs("div", { className: "flex items-center gap-3", children: [formData.type === 'in' ? (_jsx(TrendingUp, { className: "h-5 w-5 text-green-500" })) : (_jsx(TrendingDown, { className: "h-5 w-5 text-red-500" })), _jsx("h2", { className: "text-xl font-semibold", children: formData.type === 'in' ? 'Entrada de Estoque' : 'Saída de Estoque' })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg space-y-2", children: [_jsx("h3", { className: "font-medium text-gray-900", children: "Produto Selecionado" }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsxs("p", { children: [_jsx("span", { className: "font-medium", children: "Nome:" }), " ", item.productName] }), _jsxs("p", { children: [_jsx("span", { className: "font-medium", children: "SKU:" }), " ", item.sku] }), _jsxs("p", { children: [_jsx("span", { className: "font-medium", children: "Estoque Atual:" }), " ", item.currentStock, " un."] })] })] }), !movementType && (_jsxs("div", { children: [_jsx(Label, { children: "Tipo de Movimenta\u00E7\u00E3o" }), _jsxs("div", { className: "flex gap-4 mt-2", children: [_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "radio", name: "type", value: "in", checked: formData.type === 'in', onChange: (e) => handleInputChange('type', e.target.value), className: "text-green-600" }), _jsx(TrendingUp, { className: "h-4 w-4 text-green-500" }), _jsx("span", { children: "Entrada" })] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "radio", name: "type", value: "out", checked: formData.type === 'out', onChange: (e) => handleInputChange('type', e.target.value), className: "text-red-600" }), _jsx(TrendingDown, { className: "h-4 w-4 text-red-500" }), _jsx("span", { children: "Sa\u00EDda" })] })] })] })), _jsxs("div", { children: [_jsx(Label, { htmlFor: "quantity", children: "Quantidade *" }), _jsx(Input, { id: "quantity", type: "number", min: "1", max: formData.type === 'out' ? item.currentStock : undefined, value: formData.quantity, onChange: (e) => handleInputChange('quantity', parseInt(e.target.value) || 0), required: true }), formData.type === 'out' && formData.quantity > item.currentStock && (_jsxs("p", { className: "text-sm text-red-600 mt-1", children: ["Quantidade n\u00E3o pode ser maior que o estoque atual (", item.currentStock, " un.)"] }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "reason", children: "Motivo *" }), _jsxs("select", { id: "reason", value: formData.reason, onChange: (e) => handleInputChange('reason', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", required: true, children: [_jsx("option", { value: "", children: "Selecione o motivo" }), reasonOptions[formData.type].map(reason => (_jsx("option", { value: reason, children: reason }, reason)))] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "date", children: "Data *" }), _jsx(Input, { id: "date", type: "date", value: formData.date, onChange: (e) => handleInputChange('date', e.target.value), required: true })] }), formData.quantity > 0 && (_jsxs("div", { className: `p-4 rounded-lg ${formData.type === 'in' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`, children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Resumo da Movimenta\u00E7\u00E3o" }), _jsxs("div", { className: "text-sm space-y-1", children: [_jsxs("p", { children: [_jsx("span", { className: "text-gray-600", children: "Estoque atual:" }), " ", item.currentStock, " un."] }), _jsxs("p", { children: [_jsx("span", { className: "text-gray-600", children: "Ap\u00F3s movimenta\u00E7\u00E3o:" }), ' ', _jsxs("span", { className: `font-medium ${formData.type === 'in' ? 'text-green-600' : 'text-red-600'}`, children: [formData.type === 'in'
                                                            ? item.currentStock + formData.quantity
                                                            : item.currentStock - formData.quantity, " un."] })] })] })] })), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "Cancelar" }), _jsx(Button, { type: "submit", disabled: formData.type === 'out' && formData.quantity > item.currentStock, className: formData.type === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700', children: formData.type === 'in' ? 'Registrar Entrada' : 'Registrar Saída' })] })] })] }) }));
}
