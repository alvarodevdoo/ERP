interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    stock: number;
    status: 'active' | 'inactive';
    createdAt: string;
}
interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Omit<Product, 'id' | 'createdAt'>) => void;
    product?: Product | null;
    mode: 'create' | 'edit';
}
export declare function ProductModal({ isOpen, onClose, onSave, product, mode }: ProductModalProps): import("react/jsx-runtime").JSX.Element;
export {};
