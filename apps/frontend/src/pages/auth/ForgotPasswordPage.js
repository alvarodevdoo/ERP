import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
const forgotPasswordSchema = z.object({
    email: z.string().email('Email inválido'),
});
export function ForgotPasswordPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    });
    const onSubmit = async () => {
        try {
            // Simular envio de email de recuperação
            await new Promise(resolve => setTimeout(resolve, 2000));
            setIsSubmitted(true);
            toast.success('Email de recuperação enviado!');
        }
        catch {
            toast.error('Erro ao enviar email de recuperação');
        }
    };
    if (isSubmitted) {
        return (_jsxs("div", { className: "space-y-6 text-center", children: [_jsx("div", { className: "mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center", children: _jsx(Mail, { className: "h-8 w-8 text-green-600" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Email Enviado!" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Enviamos um link de recupera\u00E7\u00E3o para seu email. Verifique sua caixa de entrada e spam." })] }), _jsxs("div", { className: "space-y-4", children: [_jsx(Button, { asChild: true, className: "w-full", children: _jsxs(Link, { to: "/auth/login", children: [_jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }), "Voltar para Login"] }) }), _jsx(Button, { variant: "outline", className: "w-full", onClick: () => setIsSubmitted(false), children: "Enviar Novamente" })] })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Esqueceu a Senha?" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Digite seu email para receber um link de recupera\u00E7\u00E3o" })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", placeholder: "seu@email.com", ...register('email'), error: errors.email?.message })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isSubmitting, children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Enviando..."] })) : ('Enviar Link de Recuperação') })] }), _jsx("div", { className: "text-center", children: _jsxs(Link, { to: "/auth/login", className: "inline-flex items-center text-sm font-medium text-primary hover:text-primary/80", children: [_jsx(ArrowLeft, { className: "mr-1 h-4 w-4" }), "Voltar para Login"] }) })] }));
}
