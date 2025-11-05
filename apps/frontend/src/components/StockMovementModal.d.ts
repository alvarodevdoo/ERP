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
interface StockMovement {
    type: 'in' | 'out';
    quantity: number;
    reason: string;
    date: string;
}
interface StockMovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (movement: StockMovement) => void;
    item?: StockItem | null;
    movementType?: 'in' | 'out' | null;
}
export declare function StockMovementModal({ isOpen, onClose, onSave, item, movementType }: StockMovementModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
