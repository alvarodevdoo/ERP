import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { buttonVariants } from './button-variants';
const Button = forwardRef(({ className, variant, size, ...props }, ref) => {
    return (_jsx("button", { className: cn(buttonVariants({ variant, size, className })), ref: ref, ...props }));
});
Button.displayName = 'Button';
export { Button };
