import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { AuthService } from './auth.service';
import { AppError } from '../../../shared/errors/AppError';
import { AuthRepository } from '../repositories/auth.repository';

// Mock do PrismaClient
vi.mock('@prisma/client', () => {
  const PrismaClient = vi.fn();
  return { PrismaClient };
});

// Mock do bcrypt
vi.mock('bcryptjs', async () => {
  const actual = await vi.importActual('bcryptjs');
  return {
    default: {
      ...actual,
      hash: vi.fn().mockResolvedValue('hashed_password'),
      compare: vi.fn().mockResolvedValue(true),
    },
  };
});

// Mock do jsonwebtoken com export default compatível
vi.mock('jsonwebtoken', () => {
  const sign = vi.fn().mockReturnValue('mock_token');
  const verify = vi.fn().mockReturnValue({ userId: 'user-123', companyId: 'company-123' });
  return {
    default: { sign, verify },
    sign,
    verify,
  };
});

// Mock do AuthRepository
vi.mock('../repositories/auth.repository', () => {
  const AuthRepository = vi.fn(() => ({
    findUserByEmail: vi.fn(),
    findUserById: vi.fn(),
    createUserWithCompany: vi.fn(),
    updateUser: vi.fn(),
    emailExists: vi.fn(),
    companyCnpjExists: vi.fn(),
  }));
  return { AuthRepository };
});

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: any;
  let authRepository: AuthRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = new PrismaClient();
    authRepository = new AuthRepository();
    
    // Mock dos métodos do prisma
    prisma.user = {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    };
    
    prisma.refreshToken = {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn()
    };
    
    authService = new AuthService(prisma, authRepository);
  });

  describe('login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        isActive: true,
        companyId: 'company-123',
        company: { id: 'company-123', name: 'Test Company', cnpj: '12345678901234' },
        employee: null,
      };
      
      (authRepository.findUserByEmail as vi.Mock).mockResolvedValue(mockUser);
      (prisma.refreshToken.create as vi.Mock).mockResolvedValue({ token: 'refresh_token' });
      
      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
    });
    
    it('deve lançar erro para usuário não encontrado', async () => {
      (authRepository.findUserByEmail as vi.Mock).mockResolvedValue(null);
      
      await expect(authService.login({
        email: 'nonexistent@example.com',
        password: 'password123'
      })).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshToken', () => {
    it('deve gerar novo token de acesso com refresh token válido', async () => {
      (prisma.refreshToken.findUnique as vi.Mock).mockResolvedValue({
        id: 'token-123',
        token: 'valid_refresh_token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60)
      });
      
      (authRepository.findUserById as vi.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        isActive: true,
        companyId: 'company-123',
      });
      
      const result = await authService.refreshToken({ refreshToken: 'valid_refresh_token' });
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(authRepository.findUserById).toHaveBeenCalledWith('user-123');
    });
  });

  describe('register', () => {
    it('deve registrar um novo usuário', async () => {
      (authRepository.emailExists as vi.Mock).mockResolvedValue(false);
      (authRepository.companyCnpjExists as vi.Mock).mockResolvedValue(false);
      
      const mockCreatedUser = {
        id: 'new-user-123',
        email: 'new@example.com',
        name: 'New User',
        isActive: true,
        companyId: 'company-123',
        company: { id: 'company-123', name: 'New Company', cnpj: '12345678901234' },
        employee: null,
      };
      
      (authRepository.createUserWithCompany as vi.Mock).mockResolvedValue(mockCreatedUser);
      
      const result = await authService.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        companyName: 'New Company',
        companyDocument: '12345678901234',
      });
      
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('new@example.com');
      expect(authRepository.emailExists).toHaveBeenCalledWith('new@example.com');
      expect(authRepository.companyCnpjExists).toHaveBeenCalledWith('12345678901234');
      expect(authRepository.createUserWithCompany).toHaveBeenCalled();
    });
    
    it('deve lançar erro para email já existente', async () => {
      (authRepository.emailExists as vi.Mock).mockResolvedValue(true);
      
      await expect(authService.register({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
        companyName: 'Existing Company',
        companyDocument: '12345678901234',
      })).rejects.toThrow('Email já está em uso');
    });
  });
});