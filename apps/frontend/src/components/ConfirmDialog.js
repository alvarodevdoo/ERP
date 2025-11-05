import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/Dialog';
import { AlertTriangle } from 'lucide-react';
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, description, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'danger', loading = false }) {
    const handleConfirm = () => {
        onConfirm();
    };
    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    icon: 'text-red-600',
                    button: 'bg-red-600 hover:bg-red-700 text-white'
                };
            case 'warning':
                return {
                    icon: 'text-yellow-600',
                    button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
                };
            case 'info':
                return {
                    icon: 'text-blue-600',
                    button: 'bg-blue-600 hover:bg-blue-700 text-white'
                };
            default:
                return {
                    icon: 'text-red-600',
                    button: 'bg-red-600 hover:bg-red-700 text-white'
                };
        }
    };
    const styles = getVariantStyles();
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "sm:max-w-[400px]", children: [_jsxs(DialogHeader, { children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `p-2 rounded-full bg-gray-100 ${styles.icon}`, children: _jsx(AlertTriangle, { className: "h-5 w-5" }) }), _jsx("div", { children: _jsx(DialogTitle, { className: "text-left", children: title }) })] }), _jsx(DialogDescription, { className: "text-left mt-2", children: description })] }), _jsxs(DialogFooter, { className: "gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, disabled: loading, children: cancelText }), _jsx(Button, { type: "button", onClick: handleConfirm, disabled: loading, className: styles.button, children: loading ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), "Processando..."] })) : (confirmText) })] })] }) }));
}
