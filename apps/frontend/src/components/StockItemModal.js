import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
export function StockItemModal({ isOpen, onClose, onSave, item, mode }) {
    const [formData, setFormData] = useState({
        productName: '',
        sku: '',
        category: '',
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        unitCost: 0,
        location: ''
    });
    // Preencher formulário quando editar
    useEffect(() => {
        if (item && mode === 'edit') {
            setFormData({
                productName: item.productName,
                sku: item.sku,
                category: item.category,
                currentStock: item.currentStock,
                minStock: item.minStock,
                maxStock: item.maxStock,
                unitCost: item.unitCost,
                location: item.location
            });
        }
        else {
            // Limpar formulário para novo item
            setFormData({
                productName: '',
                sku: '',
                category: '',
                currentStock: 0,
                minStock: 0,
                maxStock: 0,
                unitCost: 0,
                location: ''
            });
        }
    }, [item, mode, isOpen]);
    const handleSubmit = (e) => {
        e.preventDefault();
        // Calcular valor total
        const totalValue = formData.currentStock * formData.unitCost;
        const itemData = {
            ...formData,
            totalValue,
            ...(mode === 'edit' && item ? { id: item.id } : {})
        };
        onSave(itemData);
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b", children: [_jsx("h2", { className: "text-xl font-semibold", children: mode === 'create' ? 'Novo Item de Estoque' : 'Editar Item de Estoque' }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "productName", children: "Nome do Produto *" }), _jsx(Input, { id: "productName", value: formData.productName, onChange: (e) => handleInputChange('productName', e.target.value), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "sku", children: "SKU *" }), _jsx(Input, { id: "sku", value: formData.sku, onChange: (e) => handleInputChange('sku', e.target.value), required: true })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "category", children: "Categoria *" }), _jsx(Input, { id: "category", value: formData.category, onChange: (e) => handleInputChange('category', e.target.value), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "location", children: "Localiza\u00E7\u00E3o *" }), _jsx(Input, { id: "location", value: formData.location, onChange: (e) => handleInputChange('location', e.target.value), required: true })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "currentStock", children: "Estoque Atual *" }), _jsx(Input, { id: "currentStock", type: "number", min: "0", value: formData.currentStock, onChange: (e) => handleInputChange('currentStock', parseInt(e.target.value) || 0), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "minStock", children: "Estoque M\u00EDnimo *" }), _jsx(Input, { id: "minStock", type: "number", min: "0", value: formData.minStock, onChange: (e) => handleInputChange('minStock', parseInt(e.target.value) || 0), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "maxStock", children: "Estoque M\u00E1ximo *" }), _jsx(Input, { id: "maxStock", type: "number", min: "0", value: formData.maxStock, onChange: (e) => handleInputChange('maxStock', parseInt(e.target.value) || 0), required: true })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "unitCost", children: "Custo Unit\u00E1rio (R$) *" }), _jsx(Input, { id: "unitCost", type: "number", step: "0.01", min: "0", value: formData.unitCost, onChange: (e) => handleInputChange('unitCost', parseFloat(e.target.value) || 0), required: true })] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "Cancelar" }), _jsx(Button, { type: "submit", children: mode === 'create' ? 'Criar Item' : 'Salvar Alterações' })] })] })] }) }));
}
