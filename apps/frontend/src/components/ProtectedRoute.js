import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
export function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuthStore();
    const location = useLocation();
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-32 w-32 border-b-2 border-primary" }) }));
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/auth/login", state: { from: location }, replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
export function PublicRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuthStore();
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-32 w-32 border-b-2 border-primary" }) }));
    }
    if (isAuthenticated) {
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
