import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { TrendingUp, Package, FileText, Wrench, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
export function DashboardPage() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalQuotes: 0,
        totalOrders: 0,
        totalRevenue: 0,
        lowStockItems: 0,
        pendingOrders: 0,
        monthlyGrowth: 0,
        activeCustomers: 0,
    });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // Simular carregamento de dados
        setTimeout(() => {
            setStats({
                totalProducts: 156,
                totalQuotes: 23,
                totalOrders: 45,
                totalRevenue: 125000,
                lowStockItems: 8,
                pendingOrders: 12,
                monthlyGrowth: 15.2,
                activeCustomers: 89,
            });
            setLoading(false);
        }, 1000);
    }, []);
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };
    const statCards = [
        {
            title: 'Produtos Cadastrados',
            value: stats.totalProducts,
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Orçamentos Ativos',
            value: stats.totalQuotes,
            icon: FileText,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Ordens de Serviço',
            value: stats.totalOrders,
            icon: Wrench,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: 'Faturamento Mensal',
            value: formatCurrency(stats.totalRevenue),
            icon: DollarSign,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
        },
        {
            title: 'Clientes Ativos',
            value: stats.activeCustomers,
            icon: Users,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
        },
        {
            title: 'Itens com Estoque Baixo',
            value: stats.lowStockItems,
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
    ];
    if (loading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Dashboard" }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: Array.from({ length: 6 }).map((_, i) => (_jsx(Card, { className: "p-6", children: _jsxs("div", { className: "animate-pulse", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-1/2" }), _jsx("div", { className: "h-8 w-8 bg-gray-200 rounded" })] }), _jsx("div", { className: "mt-4 h-8 bg-gray-200 rounded w-1/3" })] }) }, i))) })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Dashboard" }), _jsx("p", { className: "text-gray-600", children: "Vis\u00E3o geral do seu neg\u00F3cio" })] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(TrendingUp, { className: "h-4 w-4 mr-1 text-green-600" }), _jsxs("span", { className: "font-medium text-green-600", children: ["+", stats.monthlyGrowth, "%"] }), _jsx("span", { className: "ml-1", children: "este m\u00EAs" })] }) })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (_jsx(Card, { className: "p-6 hover:shadow-lg transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: card.title }), _jsx("p", { className: "text-2xl font-bold text-gray-900 mt-2", children: card.value })] }), _jsx("div", { className: `p-3 rounded-lg ${card.bgColor}`, children: _jsx(Icon, { className: `h-6 w-6 ${card.color}` }) })] }) }, index));
                }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { className: "p-6", children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "A\u00E7\u00F5es R\u00E1pidas" }) }), _jsxs("div", { className: "space-y-3", children: [_jsxs(Button, { className: "w-full justify-start", variant: "outline", children: [_jsx(Package, { className: "mr-2 h-4 w-4" }), "Cadastrar Produto"] }), _jsxs(Button, { className: "w-full justify-start", variant: "outline", children: [_jsx(FileText, { className: "mr-2 h-4 w-4" }), "Novo Or\u00E7amento"] }), _jsxs(Button, { className: "w-full justify-start", variant: "outline", children: [_jsx(Wrench, { className: "mr-2 h-4 w-4" }), "Nova Ordem de Servi\u00E7o"] })] })] }), _jsxs(Card, { className: "p-6", children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Alertas" }) }), _jsxs("div", { className: "space-y-3", children: [stats.lowStockItems > 0 && (_jsxs("div", { className: "flex items-center p-3 bg-red-50 rounded-lg", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-red-600 mr-3" }), _jsxs("div", { children: [_jsxs("p", { className: "text-sm font-medium text-red-800", children: [stats.lowStockItems, " itens com estoque baixo"] }), _jsx("p", { className: "text-xs text-red-600", children: "Verifique o estoque para evitar rupturas" })] })] })), stats.pendingOrders > 0 && (_jsxs("div", { className: "flex items-center p-3 bg-yellow-50 rounded-lg", children: [_jsx(Wrench, { className: "h-5 w-5 text-yellow-600 mr-3" }), _jsxs("div", { children: [_jsxs("p", { className: "text-sm font-medium text-yellow-800", children: [stats.pendingOrders, " ordens pendentes"] }), _jsx("p", { className: "text-xs text-yellow-600", children: "Ordens aguardando processamento" })] })] })), stats.lowStockItems === 0 && stats.pendingOrders === 0 && (_jsxs("div", { className: "flex items-center p-3 bg-green-50 rounded-lg", children: [_jsx(TrendingUp, { className: "h-5 w-5 text-green-600 mr-3" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-green-800", children: "Tudo funcionando perfeitamente!" }), _jsx("p", { className: "text-xs text-green-600", children: "Nenhum alerta no momento" })] })] }))] })] })] })] }));
}
