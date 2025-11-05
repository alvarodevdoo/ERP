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
interface StockItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Partial<StockItem>) => void;
    item?: StockItem | null;
    mode: 'create' | 'edit';
}
export declare function StockItemModal({ isOpen, onClose, onSave, item, mode }: StockItemModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
