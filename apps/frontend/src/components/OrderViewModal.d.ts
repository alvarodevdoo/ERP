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
interface OrderViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    order?: Order | null;
}
export declare function OrderViewModal({ isOpen, onClose, order }: OrderViewModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
