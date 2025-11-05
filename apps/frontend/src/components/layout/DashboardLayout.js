import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, Wrench, Archive, DollarSign, Settings, Menu, X, LogOut, User, Bell, } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, current: false },
    { name: 'Produtos', href: '/app/products', icon: Package, current: false },
    { name: 'Orçamentos', href: '/app/quotes', icon: FileText, current: false },
    { name: 'Ordens de Serviço', href: '/app/orders', icon: Wrench, current: false },
    { name: 'Estoque', href: '/app/stock', icon: Archive, current: false },
    { name: 'Financeiro', href: '/app/financial', icon: DollarSign, current: false },
    { name: 'Configurações', href: '/app/settings', icon: Settings, current: false },
];
export function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const handleLogout = () => {
        logout();
    };
    return (_jsxs("div", { className: "h-screen flex overflow-hidden bg-gray-100", children: [sidebarOpen && (_jsx("div", { className: "fixed inset-0 flex z-40 md:hidden", onClick: () => setSidebarOpen(false), children: _jsx("div", { className: "fixed inset-0 bg-gray-600 bg-opacity-75" }) })), _jsxs("div", { className: `${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`, children: [_jsxs("div", { className: "flex items-center justify-between h-16 px-4 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-8 h-8 bg-primary rounded-lg flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold text-sm", children: "A" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("h1", { className: "text-lg font-semibold text-gray-900", children: "ArtPlim ERP" }) })] }), _jsx("button", { className: "md:hidden", onClick: () => setSidebarOpen(false), children: _jsx(X, { className: "h-6 w-6 text-gray-400" }) })] }), _jsx("nav", { className: "mt-5 px-2 space-y-1", children: navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (_jsxs(Link, { to: item.href, className: `${isActive
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`, onClick: () => setSidebarOpen(false), children: [_jsx(item.icon, { className: `${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'} mr-3 flex-shrink-0 h-5 w-5` }), item.name] }, item.name));
                        }) }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center", children: _jsx(User, { className: "h-4 w-4 text-gray-600" }) }) }), _jsxs("div", { className: "ml-3 flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: user?.name }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: user?.company?.name })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: handleLogout, className: "ml-2", children: _jsx(LogOut, { className: "h-4 w-4" }) })] }) })] }), _jsxs("div", { className: "flex flex-col w-0 flex-1 overflow-hidden", children: [_jsxs("div", { className: "relative z-10 flex-shrink-0 flex h-16 bg-white shadow border-b border-gray-200", children: [_jsx("button", { className: "px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden", onClick: () => setSidebarOpen(true), children: _jsx(Menu, { className: "h-6 w-6" }) }), _jsxs("div", { className: "flex-1 px-4 flex justify-between items-center", children: [_jsx("div", { className: "flex-1" }), _jsxs("div", { className: "ml-4 flex items-center md:ml-6 space-x-4", children: [_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Bell, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center", children: _jsx(User, { className: "h-4 w-4 text-gray-600" }) }), _jsxs("div", { className: "hidden md:block", children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: user?.name }), _jsx("p", { className: "text-xs text-gray-500", children: user?.role?.name })] })] })] })] })] }), _jsx("main", { className: "flex-1 relative overflow-y-auto focus:outline-none", children: _jsx("div", { className: "py-6", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 md:px-8", children: children }) }) })] })] }));
}
