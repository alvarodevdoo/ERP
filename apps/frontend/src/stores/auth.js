import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/auth';
export const useAuthStore = create()(persist((set, get) => ({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
    login: async (email, password) => {
        try {
            set({ isLoading: true });
            const response = await authService.login({ email, password });
            set({
                user: response.user,
                token: response.tokens.accessToken,
                refreshToken: response.tokens.refreshToken,
                isAuthenticated: true,
                isLoading: false,
            });
        }
        catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },
    register: async (data) => {
        try {
            set({ isLoading: true });
            const response = await authService.register(data);
            set({
                user: response.user,
                token: response.tokens.accessToken,
                refreshToken: response.tokens.refreshToken,
                isAuthenticated: true,
                isLoading: false,
            });
        }
        catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },
    logout: () => {
        authService.logout();
        set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },
    refreshAuthToken: async () => {
        try {
            const { refreshToken } = get();
            if (!refreshToken)
                throw new Error('No refresh token available');
            const response = await authService.refreshToken(refreshToken);
            set({
                token: response.accessToken,
                refreshToken: response.refreshToken,
                isAuthenticated: true,
            });
        }
        catch (error) {
            // If refresh fails, logout user
            get().logout();
            throw error;
        }
    },
    updateProfile: async (data) => {
        const updatedUser = await authService.updateProfile(data);
        set(state => ({
            user: { ...state.user, ...updatedUser },
        }));
    },
    initializeAuth: () => {
        const { token } = get();
        if (token) {
            // Validate token and get user info
            authService.getCurrentUser()
                .then(user => {
                set({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                });
            })
                .catch(() => {
                // Token is invalid, logout
                get().logout();
            });
        }
        else {
            set({ isLoading: false });
        }
    },
    setLoading: (loading) => {
        set({ isLoading: loading });
    },
}), {
    name: 'auth-storage',
    partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
    }),
}));
