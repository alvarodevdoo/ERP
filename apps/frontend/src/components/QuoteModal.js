import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/Dialog';
export function QuoteModal({ isOpen, onClose, onSave, quote, mode }) {
    const [formData, setFormData] = useState({
        client: '',
        description: '',
        value: 0,
        status: 'pending',
        validUntil: ''
    });
    const [loading, setLoading] = useState(false);
    // Preencher formulário quando estiver editando
    useEffect(() => {
        if (mode === 'edit' && quote) {
            setFormData({
                client: quote.client,
                description: quote.description,
                value: quote.value,
                status: quote.status,
                validUntil: quote.validUntil
            });
        }
        else {
            // Limpar formulário para criação
            const defaultValidUntil = new Date();
            defaultValidUntil.setDate(defaultValidUntil.getDate() + 30); // 30 dias a partir de hoje
            setFormData({
                client: '',
                description: '',
                value: 0,
                status: 'pending',
                validUntil: defaultValidUntil.toISOString().split('T')[0]
            });
        }
    }, [mode, quote, isOpen]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 1000));
            onSave(formData);
            onClose();
        }
        catch (error) {
            console.error('Erro ao salvar orçamento:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "sm:max-w-[500px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: mode === 'create' ? 'Novo Orçamento' : 'Editar Orçamento' }), _jsx(DialogDescription, { children: mode === 'create'
                                ? 'Crie um novo orçamento para seu cliente.'
                                : 'Faça alterações nas informações do orçamento.' })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "client", children: "Cliente *" }), _jsx(Input, { id: "client", type: "text", value: formData.client, onChange: (e) => handleInputChange('client', e.target.value), placeholder: "Nome do cliente", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", children: "Descri\u00E7\u00E3o do Servi\u00E7o *" }), _jsx("textarea", { id: "description", value: formData.description, onChange: (e) => handleInputChange('description', e.target.value), placeholder: "Descreva o servi\u00E7o a ser realizado", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none", rows: 4, required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "value", children: "Valor (R$) *" }), _jsx(Input, { id: "value", type: "number", step: "0.01", min: "0", value: formData.value, onChange: (e) => handleInputChange('value', parseFloat(e.target.value) || 0), placeholder: "0,00", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "validUntil", children: "V\u00E1lido at\u00E9 *" }), _jsx(Input, { id: "validUntil", type: "date", value: formData.validUntil, onChange: (e) => handleInputChange('validUntil', e.target.value), required: true })] }), mode === 'edit' && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "status", children: "Status" }), _jsxs("select", { id: "status", value: formData.status, onChange: (e) => handleInputChange('status', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", children: [_jsx("option", { value: "pending", children: "Pendente" }), _jsx("option", { value: "approved", children: "Aprovado" }), _jsx("option", { value: "rejected", children: "Rejeitado" }), _jsx("option", { value: "expired", children: "Expirado" })] })] }))] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, disabled: loading, children: "Cancelar" }), _jsx(Button, { type: "submit", disabled: loading, children: loading ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), "Salvando..."] })) : (mode === 'create' ? 'Criar Orçamento' : 'Salvar Alterações') })] })] })] }) }));
}
