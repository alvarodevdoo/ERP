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
interface QuoteViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    quote: Quote | null;
}
export declare function QuoteViewModal({ isOpen, onClose, quote }: QuoteViewModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
