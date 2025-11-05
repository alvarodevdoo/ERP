import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
export function FinancialEntryModal({ isOpen, onClose, onSave, entry, mode, defaultType }) {
    const [formData, setFormData] = useState({
        description: '',
        type: defaultType || 'income',
        category: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        status: 'pending',
        paymentMethod: '',
        reference: '',
        notes: ''
    });
    useEffect(() => {
        if (entry && mode === 'edit') {
            setFormData({
                description: entry.description,
                type: entry.type,
                category: entry.category,
                amount: entry.amount,
                date: entry.date,
                dueDate: entry.dueDate || '',
                status: entry.status,
                paymentMethod: entry.paymentMethod || '',
                reference: entry.reference || '',
                notes: entry.notes || ''
            });
        }
        else if (mode === 'create') {
            setFormData({
                description: '',
                type: defaultType || 'income',
                category: '',
                amount: 0,
                date: new Date().toISOString().split('T')[0],
                dueDate: '',
                status: 'pending',
                paymentMethod: '',
                reference: '',
                notes: ''
            });
        }
    }, [entry, mode, defaultType, isOpen]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.description.trim() || !formData.category.trim() || formData.amount <= 0) {
            return;
        }
        const entryData = {
            ...formData,
            dueDate: formData.dueDate || undefined,
            paymentMethod: formData.paymentMethod || undefined,
            reference: formData.reference || undefined,
            notes: formData.notes || undefined
        };
        onSave(entryData);
        onClose();
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    if (!isOpen)
        return null;
    const categories = {
        income: ['Vendas', 'Serviços', 'Outras Receitas'],
        expense: ['Compras', 'Despesas Fixas', 'Utilidades', 'Marketing', 'Outras Despesas']
    };
    const statusOptions = [
        { value: 'pending', label: 'Pendente' },
        { value: 'paid', label: 'Pago' },
        { value: 'overdue', label: 'Vencido' },
        { value: 'cancelled', label: 'Cancelado' }
    ];
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b", children: [_jsx("h2", { className: "text-xl font-semibold", children: mode === 'create' ? 'Novo Lançamento' : 'Editar Lançamento' }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", children: "Descri\u00E7\u00E3o *" }), _jsx(Input, { id: "description", value: formData.description, onChange: (e) => handleInputChange('description', e.target.value), placeholder: "Descri\u00E7\u00E3o do lan\u00E7amento", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "type", children: "Tipo *" }), _jsxs("select", { id: "type", value: formData.type, onChange: (e) => handleInputChange('type', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", required: true, children: [_jsx("option", { value: "income", children: "Receita" }), _jsx("option", { value: "expense", children: "Despesa" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "category", children: "Categoria *" }), _jsxs("select", { id: "category", value: formData.category, onChange: (e) => handleInputChange('category', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", required: true, children: [_jsx("option", { value: "", children: "Selecione uma categoria" }), categories[formData.type].map(cat => (_jsx("option", { value: cat, children: cat }, cat)))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "amount", children: "Valor *" }), _jsx(Input, { id: "amount", type: "number", step: "0.01", min: "0", value: formData.amount, onChange: (e) => handleInputChange('amount', parseFloat(e.target.value) || 0), placeholder: "0,00", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "date", children: "Data *" }), _jsx(Input, { id: "date", type: "date", value: formData.date, onChange: (e) => handleInputChange('date', e.target.value), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "dueDate", children: "Data de Vencimento" }), _jsx(Input, { id: "dueDate", type: "date", value: formData.dueDate, onChange: (e) => handleInputChange('dueDate', e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "status", children: "Status" }), _jsx("select", { id: "status", value: formData.status, onChange: (e) => handleInputChange('status', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", children: statusOptions.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "paymentMethod", children: "Forma de Pagamento" }), _jsx(Input, { id: "paymentMethod", value: formData.paymentMethod, onChange: (e) => handleInputChange('paymentMethod', e.target.value), placeholder: "Ex: Cart\u00E3o de Cr\u00E9dito, PIX, Dinheiro" })] }), _jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { htmlFor: "reference", children: "Refer\u00EAncia" }), _jsx(Input, { id: "reference", value: formData.reference, onChange: (e) => handleInputChange('reference', e.target.value), placeholder: "Ex: OS-2024-001, NF-12345" })] }), _jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { htmlFor: "notes", children: "Observa\u00E7\u00F5es" }), _jsx(Textarea, { id: "notes", value: formData.notes, onChange: (e) => handleInputChange('notes', e.target.value), placeholder: "Observa\u00E7\u00F5es adicionais...", rows: 3 })] })] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "Cancelar" }), _jsx(Button, { type: "submit", children: mode === 'create' ? 'Criar Lançamento' : 'Salvar Alterações' })] })] })] }) }));
}
