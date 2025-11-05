interface Order {
    id: string;
    number: string;
    customerName: string;
    customerPhone: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'waiting_approval' | 'completed' | 'cancelled';
    assignedTo: string;
    estimatedDelivery: string;
    totalValue: number;
    createdAt: string;
}
interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (order: Partial<Order>) => void;
    order?: Order | null;
    mode: 'create' | 'edit';
}
export declare function OrderModal({ isOpen, onClose, onSave, order, mode }: OrderModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
