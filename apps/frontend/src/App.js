import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { useEffect } from 'react';
// Layout Components
import { AuthLayout } from '@/components/layout/AuthLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
// Dashboard Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ProductsPage } from '@/pages/products/ProductsPage';
import { QuotesPage } from '@/pages/quotes/QuotesPage';
import { OrdersPage } from '@/pages/orders/OrdersPage';
import { StockPage } from '@/pages/stock/StockPage';
import { FinancialPage } from '@/pages/financial/FinancialPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
// Landing Page
import LandingPage from '@/pages/LandingPage';
// Protected Route Component
function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuthStore();
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }));
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/auth/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
// Public Route Component (redirect if authenticated)
function PublicRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuthStore();
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }));
    }
    if (isAuthenticated) {
        return _jsx(Navigate, { to: "/app/dashboard", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
function App() {
    const { initializeAuth } = useAuthStore();
    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/auth/*", element: _jsx(PublicRoute, { children: _jsx(AuthLayout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "forgot-password", element: _jsx(ForgotPasswordPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/auth/login", replace: true }) })] }) }) }) }), _jsx(Route, { path: "/app/*", element: _jsx(ProtectedRoute, { children: _jsx(DashboardLayout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "products", element: _jsx(ProductsPage, {}) }), _jsx(Route, { path: "quotes", element: _jsx(QuotesPage, {}) }), _jsx(Route, { path: "orders", element: _jsx(OrdersPage, {}) }), _jsx(Route, { path: "stock", element: _jsx(StockPage, {}) }), _jsx(Route, { path: "financial", element: _jsx(FinancialPage, {}) }), _jsx(Route, { path: "settings", element: _jsx(SettingsPage, {}) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/app/dashboard", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/app/dashboard", replace: true }) })] }) }) }) })] }));
}
export default App;
