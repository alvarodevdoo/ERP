import type { User } from '@/types/auth';
interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    refreshAuthToken: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    initializeAuth: () => void;
    setLoading: (loading: boolean) => void;
}
interface RegisterData {
    name: string;
    email: string;
    password: string;
    companyName: string;
}
export declare const useAuthStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<AuthState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<AuthState, {
            token: string | null;
            refreshToken: string | null;
            user: User | null;
            isAuthenticated: boolean;
        }>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AuthState) => void) => () => void;
        onFinishHydration: (fn: (state: AuthState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<AuthState, {
            token: string | null;
            refreshToken: string | null;
            user: User | null;
            isAuthenticated: boolean;
        }>>;
    };
}>;
export {};
