import { api } from './api';
class AuthService {
    async login(data) {
        const response = await api.post('/auth/login', data);
        // Set token for future requests
        if (response.data.tokens.accessToken) {
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.tokens.accessToken}`;
        }
        return response.data;
    }
    async register(data) {
        const response = await api.post('/auth/register', data);
        // Set token for future requests
        if (response.data.tokens.accessToken) {
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.tokens.accessToken}`;
        }
        return response.data;
    }
    async refreshToken(refreshToken) {
        const response = await api.post('/auth/refresh', {
            refreshToken,
        });
        // Update token for future requests
        if (response.data.accessToken) {
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
        }
        return response.data;
    }
    async forgotPassword(data) {
        await api.post('/auth/forgot-password', data);
    }
    async resetPassword(data) {
        await api.post('/auth/reset-password', data);
    }
    async changePassword(data) {
        await api.post('/auth/change-password', data);
    }
    async updateProfile(data) {
        const response = await api.put('/auth/profile', data);
        return response.data;
    }
    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data;
    }
    logout() {
        // Remove token from API headers
        delete api.defaults.headers.common['Authorization'];
        // Clear any stored tokens
        localStorage.removeItem('auth-storage');
    }
    setAuthToken(token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    removeAuthToken() {
        delete api.defaults.headers.common['Authorization'];
    }
}
export const authService = new AuthService();
