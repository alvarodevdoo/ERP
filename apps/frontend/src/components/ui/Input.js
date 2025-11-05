import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
const Input = forwardRef(({ className, type, error, ...props }, ref) => {
    return (_jsxs("div", { className: "space-y-1", children: [_jsx("input", { type: type, className: cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', error && 'border-destructive focus-visible:ring-destructive', className), ref: ref, ...props }), error && (_jsx("p", { className: "text-sm text-destructive", children: error }))] }));
});
Input.displayName = 'Input';
export { Input };
