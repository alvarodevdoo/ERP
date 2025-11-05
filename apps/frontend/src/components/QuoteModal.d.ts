interface Quote {
    id: string;
    number: string;
    client: string;
    description: string;
    value: number;
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    validUntil: string;
    createdAt: string;
}
interface QuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (quote: Omit<Quote, 'id' | 'createdAt' | 'number'>) => void;
    quote?: Quote | null;
    mode: 'create' | 'edit';
}
export declare function QuoteModal({ isOpen, onClose, onSave, quote, mode }: QuoteModalProps): import("react/jsx-runtime").JSX.Element;
export {};
