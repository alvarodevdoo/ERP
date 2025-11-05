import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import App from './App.tsx';
import './index.css';
// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
            retry: (failureCount, error) => {
                // Don't retry on 4xx errors
                const errorWithResponse = error;
                if (errorWithResponse?.response?.status && errorWithResponse.response.status >= 400 && errorWithResponse.response.status < 500) {
                    return false;
                }
                return failureCount < 3;
            },
        },
        mutations: {
            retry: false,
        },
    },
});
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(BrowserRouter, { children: _jsxs(QueryClientProvider, { client: queryClient, children: [_jsx(App, {}), _jsx(Toaster, { position: "top-right", expand: false, richColors: true, closeButton: true, duration: 4000 }), _jsx(ReactQueryDevtools, { initialIsOpen: false })] }) }) }));
