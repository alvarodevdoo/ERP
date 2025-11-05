import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
const registerSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
    companyName: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
    phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
});
export function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register: registerUser } = useAuthStore();
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(registerSchema),
    });
    const onSubmit = async (data) => {
        try {
            await registerUser({
                name: data.name,
                email: data.email,
                password: data.password,
                companyName: data.companyName,
            });
            toast.success('Conta criada com sucesso!');
        }
        catch (error) {
            const errorWithResponse = error;
            toast.error(errorWithResponse.response?.data?.message || 'Erro ao criar conta');
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Criar Conta" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Cadastre-se para come\u00E7ar a usar o ArtPlim ERP" })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "name", children: "Nome Completo" }), _jsx(Input, { id: "name", type: "text", placeholder: "Seu nome completo", ...register('name'), error: errors.name?.message })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", placeholder: "seu@email.com", ...register('email'), error: errors.email?.message })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "companyName", children: "Nome da Empresa" }), _jsx(Input, { id: "companyName", type: "text", placeholder: "Nome da sua empresa", ...register('companyName'), error: errors.companyName?.message })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "phone", children: "Telefone (Opcional)" }), _jsx(Input, { id: "phone", type: "tel", placeholder: "(11) 99999-9999", ...register('phone'), error: errors.phone?.message })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "password", children: "Senha" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "password", type: showPassword ? 'text' : 'password', placeholder: "Sua senha", ...register('password'), error: errors.password?.message }), _jsx("button", { type: "button", className: "absolute inset-y-0 right-0 pr-3 flex items-center", onClick: () => setShowPassword(!showPassword), children: showPassword ? (_jsx(EyeOff, { className: "h-4 w-4 text-gray-400" })) : (_jsx(Eye, { className: "h-4 w-4 text-gray-400" })) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "confirmPassword", children: "Confirmar Senha" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "confirmPassword", type: showConfirmPassword ? 'text' : 'password', placeholder: "Confirme sua senha", ...register('confirmPassword'), error: errors.confirmPassword?.message }), _jsx("button", { type: "button", className: "absolute inset-y-0 right-0 pr-3 flex items-center", onClick: () => setShowConfirmPassword(!showConfirmPassword), children: showConfirmPassword ? (_jsx(EyeOff, { className: "h-4 w-4 text-gray-400" })) : (_jsx(Eye, { className: "h-4 w-4 text-gray-400" })) })] })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { id: "terms", name: "terms", type: "checkbox", required: true, className: "h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" }), _jsxs("label", { htmlFor: "terms", className: "ml-2 block text-sm text-gray-900", children: ["Concordo com os", ' ', _jsx(Link, { to: "/terms", className: "text-primary hover:text-primary/80", children: "Termos de Uso" }), ' ', "e", ' ', _jsx(Link, { to: "/privacy", className: "text-primary hover:text-primary/80", children: "Pol\u00EDtica de Privacidade" })] })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isSubmitting, children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Criando conta..."] })) : ('Criar Conta') })] }), _jsx("div", { className: "text-center", children: _jsxs("p", { className: "text-sm text-gray-600", children: ["J\u00E1 tem uma conta?", ' ', _jsx(Link, { to: "/auth/login", className: "font-medium text-primary hover:text-primary/80", children: "Fa\u00E7a login" })] }) })] }));
}
