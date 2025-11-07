import bcrypt from 'bcryptjs';
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
type JWTStringValue = `${number}${string}`;
import { Prisma, PrismaClient } from '@prisma/client';
import { AuthRepository } from '../repositories/auth.repository';
import { config } from '../../../config';
import { logger } from '../../../shared/logger';
import {
  LoginDto,
  LoginResponseDto,
  RegisterDto,
  RegisterResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from '../dtos';
import { UserRepository } from '../../user/repositories/user.repository';
import { CompanyRepository } from '../../company/repositories/company.repository';
import { RoleRepository } from '../../role/repositories/role.repository';

/**
 * Serviço de autenticação
 * Gerencia login, registro, tokens JWT e operações relacionadas à autenticação
 */
export class AuthService {
  private authRepository: AuthRepository;
  private prisma: PrismaClient;
  // Repositório de roles para verificação de permissões
  private roleRepository: RoleRepository;

  constructor(prisma: PrismaClient, authRepository?: AuthRepository) {
    this.prisma = prisma;
    this.authRepository = authRepository || new AuthRepository();
    this.roleRepository = new RoleRepository(this.prisma);
  }
  async login(data: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = data;

    try {
      // Buscar usuário com relacionamentos
      const user = await this.authRepository.findUserByEmail(email);

      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (!user.isActive) {
        throw new Error('Account is inactive');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Generate tokens
      if (!user.companyId) {
        throw new Error('Usuário deve estar associado a uma empresa');
      }
      const tokens = await this.generateTokens(user.id, user.companyId);

      // TODO: Implementar atualização de último login

      logger.info(`User ${user.email} logged in successfully`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          companyId: user.companyId,
          company: {
            id: user.company.id,
            name: user.company.name,
            cnpj: user.company.cnpj,
          },
          employee: user.employee ? {
            id: user.employee.id,
            role: {
              id: user.employee.role.id,
              name: user.employee.role.name,
            },
          } : undefined,
        },
        tokens,
      };
    } catch (error) {
      logger.error({ err: error }, 'AuthService.login');
      throw error;
    }
  }

  async register(data: RegisterDto): Promise<RegisterResponseDto> {
    const { name, email, password, companyName, companyDocument } = data;

    try {
      // Verificar se usuário já existe
      const emailExists = await this.authRepository.emailExists(email);
      if (emailExists) {
        throw new Error('Email já está em uso');
      }

      // Verificar se empresa já existe
      const cnpjExists = await this.authRepository.companyCnpjExists(companyDocument);
      if (cnpjExists) {
        throw new Error('CNPJ da empresa já está em uso');
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 12);

      // Criar usuário e empresa usando repositório
      const result = await this.authRepository.createUserWithCompany(
        { name, email, password: hashedPassword },
        { name: companyName, cnpj: companyDocument }
      );

      // Generate tokens
      const tokens = await this.generateTokens(result.id, result.companyId);

      logger.info(`New company ${companyName} and admin user ${email} registered`);

      return {
        user: {
          id: result.id,
          email: result.email,
          name: result.name,
          companyId: result.companyId,
          company: {
            id: result.company.id,
            name: result.company.name,
            cnpj: result.company.cnpj,
          },
          employee: result.employee ? {
            id: result.employee.id,
            role: {
              id: result.employee.role.id,
              name: result.employee.role.name,
            },
          } : undefined,
        },
        tokens,
      };
    } catch (error) {
      logger.error({ err: error }, 'AuthService.register');
      throw error;
    }
  }

  async refreshToken(data: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    const { refreshToken } = data;

    try {
      // Verificar e decodificar refresh token
      const decoded = jwt.verify(refreshToken, config.JWT_SECRET as string) as { userId: string; companyId: string };
      
      // Buscar usuário
      const user = await this.authRepository.findUserById(decoded.userId);

      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      if (!user.companyId) {
        throw new Error('Usuário deve estar associado a uma empresa');
      }
      const tokens = await this.generateTokens(user.id, user.companyId);

      return tokens;
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<void> {
    const { email } = data;

    try {
      // Buscar usuário
      const user = await this.authRepository.findUserByEmail(email);

      if (!user) {
        // Don't reveal if email exists
        return;
      }

      // TODO: Implementar sistema de reset de senha
      // Por enquanto, apenas log da solicitação
      logger.info(`Password reset requested for ${email}`);
    } catch (error) {
      logger.error({ err: error }, 'AuthService.forgotPassword');
      throw error;
    }
  }

  async resetPassword(_data: ResetPasswordDto): Promise<void> {
    // TODO: Implementar sistema de reset de senha
    throw new Error('Reset password functionality not implemented yet');
  }

  async changePassword(userId: string, data: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword } = data;

    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.authRepository.updateUser(userId, {
      password: hashedPassword,
    });

    logger.info(`Password changed for user ${user.email}`);
  }

  async updateProfile(userId: string, data: UpdateProfileDto): Promise<Record<string, unknown>> {
    try {
      // Converte undefined para null para compatibilidade com Prisma
      const updateData: Prisma.UserUpdateInput = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      
      const user = await this.authRepository.updateUser(userId, updateData);
      logger.info(`Perfil atualizado para usuário ${user.email}`);
      return user;
    } catch (error) {
      logger.error({ err: error }, 'AuthService.updateProfile');
      throw new Error('Falha ao atualizar perfil');
    }
  }

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      // Delegar verificação ao RoleRepository usando o formato 'resource:action'
      const [resource, action] = permission.split(':');
      if (resource && action) {
        return await this.roleRepository.userHasPermission(userId, action, resource);
      } else {
        // Se não houver separação por ':', usar como permissão simples
        return await this.roleRepository.userHasPermission(userId, permission);
      }
    } catch (error) {
      logger.error({ err: error }, 'AuthService.hasPermission');
      return false;
    }
  }

  private async generateTokens(userId: string, companyId: string): Promise<RefreshTokenResponseDto> {
    if (!companyId) {
      throw new Error('CompanyId é obrigatório para gerar tokens');
    }

    const payload: JwtPayload = { userId, companyId };

    const secret: Secret = config.JWT_SECRET as unknown as Secret;
    const accessOptions = ({ expiresIn: config.JWT_EXPIRES_IN } as unknown) as SignOptions;
    const refreshOptions = ({ expiresIn: config.JWT_REFRESH_EXPIRES_IN } as unknown) as SignOptions;
    const accessToken = jwt.sign(payload, secret, accessOptions);
    const refreshToken = jwt.sign(payload, secret, refreshOptions);

    return {
      accessToken,
      refreshToken,
    };
  }
}