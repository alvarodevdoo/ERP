interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}
export declare function ConfirmDialog({ isOpen, onClose, onConfirm, title, description, confirmText, cancelText, variant, loading }: ConfirmDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
