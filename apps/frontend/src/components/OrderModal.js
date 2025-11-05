import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
export function OrderModal({ isOpen, onClose, onSave, order, mode }) {
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
        estimatedDelivery: '',
        totalValue: 0
    });
    // Preencher formulário quando editando
    useEffect(() => {
        if (mode === 'edit' && order) {
            setFormData({
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                description: order.description,
                priority: order.priority,
                assignedTo: order.assignedTo,
                estimatedDelivery: order.estimatedDelivery,
                totalValue: order.totalValue
            });
        }
        else {
            // Limpar formulário para criação
            setFormData({
                customerName: '',
                customerPhone: '',
                description: '',
                priority: 'medium',
                assignedTo: '',
                estimatedDelivery: '',
                totalValue: 0
            });
        }
    }, [mode, order, isOpen]);
    const handleSubmit = (e) => {
        e.preventDefault();
        // Validações básicas
        if (!formData.customerName.trim()) {
            toast.error('Nome do cliente é obrigatório');
            return;
        }
        if (!formData.description.trim()) {
            toast.error('Descrição é obrigatória');
            return;
        }
        if (!formData.assignedTo.trim()) {
            toast.error('Responsável é obrigatório');
            return;
        }
        if (!formData.estimatedDelivery) {
            toast.error('Data de entrega estimada é obrigatória');
            return;
        }
        // Preparar dados para salvar
        const orderData = {
            ...formData,
            id: mode === 'edit' ? order?.id : undefined
        };
        onSave(orderData);
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs(Card, { className: "w-full max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-4", children: [_jsx(CardTitle, { children: mode === 'create' ? 'Nova Ordem de Serviço' : 'Editar Ordem de Serviço' }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Nome do Cliente *" }), _jsx(Input, { value: formData.customerName, onChange: (e) => handleInputChange('customerName', e.target.value), placeholder: "Digite o nome do cliente", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Telefone" }), _jsx(Input, { value: formData.customerPhone, onChange: (e) => handleInputChange('customerPhone', e.target.value), placeholder: "(11) 99999-9999" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Descri\u00E7\u00E3o do Servi\u00E7o *" }), _jsx("textarea", { value: formData.description, onChange: (e) => handleInputChange('description', e.target.value), placeholder: "Descreva o servi\u00E7o a ser realizado", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", rows: 3, required: true })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Prioridade" }), _jsxs("select", { value: formData.priority, onChange: (e) => handleInputChange('priority', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", children: [_jsx("option", { value: "low", children: "Baixa" }), _jsx("option", { value: "medium", children: "M\u00E9dia" }), _jsx("option", { value: "high", children: "Alta" }), _jsx("option", { value: "urgent", children: "Urgente" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Respons\u00E1vel *" }), _jsx(Input, { value: formData.assignedTo, onChange: (e) => handleInputChange('assignedTo', e.target.value), placeholder: "Nome do t\u00E9cnico respons\u00E1vel", required: true })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Data de Entrega Estimada *" }), _jsx(Input, { type: "date", value: formData.estimatedDelivery, onChange: (e) => handleInputChange('estimatedDelivery', e.target.value), required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Valor Total (R$)" }), _jsx(Input, { type: "number", step: "0.01", min: "0", value: formData.totalValue, onChange: (e) => handleInputChange('totalValue', parseFloat(e.target.value) || 0), placeholder: "0,00" })] })] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "Cancelar" }), _jsx(Button, { type: "submit", children: mode === 'create' ? 'Criar OS' : 'Salvar Alterações' })] })] }) })] }) }));
}
