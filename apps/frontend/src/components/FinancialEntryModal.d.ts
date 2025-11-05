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
interface FinancialEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: Omit<FinancialEntry, 'id'>) => void;
    entry?: FinancialEntry | null;
    mode: 'create' | 'edit';
    defaultType?: 'income' | 'expense';
}
export declare function FinancialEntryModal({ isOpen, onClose, onSave, entry, mode, defaultType }: FinancialEntryModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
