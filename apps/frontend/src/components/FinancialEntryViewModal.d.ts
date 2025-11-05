interface FinancialEntry {
    id: string;
    description: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string;
    dueDate?: string;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    paymentMethod?: string;
    reference?: string;
    notes?: string;
}
interface FinancialEntryViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry: FinancialEntry | null;
}
export declare function FinancialEntryViewModal({ isOpen, onClose, entry }: FinancialEntryViewModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
