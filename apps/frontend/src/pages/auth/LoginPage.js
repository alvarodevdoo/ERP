import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Key } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});
export function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuthStore();
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(loginSchema),
    });
    // Função para preencher automaticamente as credenciais de desenvolvimento
    const fillDevelopmentCredentials = () => {
        setValue('email', 'admin@artplim.com.br');
        setValue('password', 'admin123');
        toast.info('Credenciais de desenvolvimento preenchidas!');
    };
    const onSubmit = async (data) => {
        try {
            await login(data.email, data.password);
            toast.success('Login realizado com sucesso!');
        }
        catch (error) {
            const errorWithResponse = error;
            toast.error(errorWithResponse.response?.data?.message || 'Erro ao fazer login');
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Entrar" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Acesse sua conta para continuar" })] }), _jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(Key, { className: "w-5 h-5 text-yellow-600 mr-2" }), _jsx("h3", { className: "text-sm font-semibold text-yellow-800", children: "Credenciais de Desenvolvimento" })] }), _jsxs("div", { className: "text-xs text-yellow-700 space-y-1 mb-3", children: [_jsxs("p", { children: [_jsx("strong", { children: "Email:" }), " admin@artplim.com.br"] }), _jsxs("p", { children: [_jsx("strong", { children: "Senha:" }), " admin123"] })] }), _jsx("button", { type: "button", onClick: fillDevelopmentCredentials, className: "w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded text-xs font-medium transition-colors duration-200 border border-yellow-300", children: "Preencher Automaticamente" }), _jsx("p", { className: "text-xs text-yellow-600 mt-2 text-center", children: "\u26A0\uFE0F Apenas para ambiente de desenvolvimento" })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", placeholder: "seu@email.com", ...register('email'), error: errors.email?.message })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "password", children: "Senha" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "password", type: showPassword ? 'text' : 'password', placeholder: "Sua senha", ...register('password'), error: errors.password?.message }), _jsx("button", { type: "button", className: "absolute inset-y-0 right-0 pr-3 flex items-center", onClick: () => setShowPassword(!showPassword), children: showPassword ? (_jsx(EyeOff, { className: "h-4 w-4 text-gray-400" })) : (_jsx(Eye, { className: "h-4 w-4 text-gray-400" })) })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("input", { id: "remember-me", name: "remember-me", type: "checkbox", className: "h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" }), _jsx("label", { htmlFor: "remember-me", className: "ml-2 block text-sm text-gray-900", children: "Lembrar de mim" })] }), _jsx("div", { className: "text-sm", children: _jsx(Link, { to: "/auth/forgot-password", className: "font-medium text-primary hover:text-primary/80", children: "Esqueceu a senha?" }) })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isSubmitting, children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Entrando..."] })) : ('Entrar') })] }), _jsx("div", { className: "text-center", children: _jsxs("p", { className: "text-sm text-gray-600", children: ["N\u00E3o tem uma conta?", ' ', _jsx(Link, { to: "/auth/register", className: "font-medium text-primary hover:text-primary/80", children: "Cadastre-se" })] }) })] }));
}
