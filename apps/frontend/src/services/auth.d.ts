import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, RefreshTokenResponse, ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest, UpdateProfileRequest, User } from '@/types/auth';
declare class AuthService {
    login(data: LoginRequest): Promise<LoginResponse>;
    register(data: RegisterRequest): Promise<RegisterResponse>;
    refreshToken(refreshToken: string): Promise<RefreshTokenResponse>;
    forgotPassword(data: ForgotPasswordRequest): Promise<void>;
    resetPassword(data: ResetPasswordRequest): Promise<void>;
    changePassword(data: ChangePasswordRequest): Promise<void>;
    updateProfile(data: UpdateProfileRequest): Promise<User>;
    getCurrentUser(): Promise<User>;
    logout(): void;
    setAuthToken(token: string): void;
    removeAuthToken(): void;
}
export declare const authService: AuthService;
export {};
