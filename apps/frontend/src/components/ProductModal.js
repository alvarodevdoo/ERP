import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/Dialog';
export function ProductModal({ isOpen, onClose, onSave, product, mode }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: 0,
        stock: 0,
        status: 'active'
    });
    const [loading, setLoading] = useState(false);
    // Preencher formulário quando estiver editando
    useEffect(() => {
        if (mode === 'edit' && product) {
            setFormData({
                name: product.name,
                description: product.description,
                category: product.category,
                price: product.price,
                stock: product.stock,
                status: product.status
            });
        }
        else {
            // Limpar formulário para criação
            setFormData({
                name: '',
                description: '',
                category: '',
                price: 0,
                stock: 0,
                status: 'active'
            });
        }
    }, [mode, product, isOpen]);
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
            console.error('Erro ao salvar produto:', error);
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
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "sm:max-w-[500px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: mode === 'create' ? 'Novo Produto' : 'Editar Produto' }), _jsx(DialogDescription, { children: mode === 'create'
                                ? 'Adicione um novo produto ao seu catálogo.'
                                : 'Faça alterações nas informações do produto.' })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", children: "Nome do Produto *" }), _jsx(Input, { id: "name", type: "text", value: formData.name, onChange: (e) => handleInputChange('name', e.target.value), placeholder: "Digite o nome do produto", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", children: "Descri\u00E7\u00E3o" }), _jsx("textarea", { id: "description", value: formData.description, onChange: (e) => handleInputChange('description', e.target.value), placeholder: "Digite a descri\u00E7\u00E3o do produto", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none", rows: 3 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "category", children: "Categoria *" }), _jsx(Input, { id: "category", type: "text", value: formData.category, onChange: (e) => handleInputChange('category', e.target.value), placeholder: "Digite a categoria", required: true })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "price", children: "Pre\u00E7o (R$) *" }), _jsx(Input, { id: "price", type: "number", step: "0.01", min: "0", value: formData.price, onChange: (e) => handleInputChange('price', parseFloat(e.target.value) || 0), placeholder: "0,00", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "stock", children: "Estoque *" }), _jsx(Input, { id: "stock", type: "number", min: "0", value: formData.stock, onChange: (e) => handleInputChange('stock', parseInt(e.target.value) || 0), placeholder: "0", required: true })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "status", children: "Status" }), _jsxs("select", { id: "status", value: formData.status, onChange: (e) => handleInputChange('status', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", children: [_jsx("option", { value: "active", children: "Ativo" }), _jsx("option", { value: "inactive", children: "Inativo" })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, disabled: loading, children: "Cancelar" }), _jsx(Button, { type: "submit", disabled: loading, children: loading ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), "Salvando..."] })) : (mode === 'create' ? 'Criar Produto' : 'Salvar Alterações') })] })] })] }) }));
}
