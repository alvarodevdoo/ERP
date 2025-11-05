interface StockItem {
    id: string;
    productName: string;
    sku: string;
    category: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    unitCost: number;
    totalValue: number;
    location: string;
    lastMovement: {
        type: 'in' | 'out';
        quantity: number;
        date: string;
        reason: string;
    };
}
interface StockItemViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    item?: StockItem | null;
}
export declare function StockItemViewModal({ isOpen, onClose, item }: StockItemViewModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
