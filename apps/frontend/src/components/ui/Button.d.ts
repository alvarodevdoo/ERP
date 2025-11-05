import { ButtonHTMLAttributes } from 'react';
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from './button-variants';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}
declare const Button: import("react").ForwardRefExoticComponent<ButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
export { Button };
