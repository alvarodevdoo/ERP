import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories';
import { CompanyRepository } from '../../company/repositories';
import { logger } from '../../../shared/logger/index';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  UserFiltersDto,
  UserListResponseDto,
} from '../dtos';
import { AppError } from '../../../shared/errors/AppError';
import { validateCPF } from '../../../shared/utils/validators';
import { User } from '@prisma/client';

/**
 * Service para operações de usuário
 * Implementa regras de negócio e validações
 */
export class UserService {
  private userRepository: UserRepository;
  private companyRepository: CompanyRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.companyRepository = new CompanyRepository();
  }

  /**
   * Cria um novo usuário
   * @param data Dados do usuário
   * @returns Usuário criado
   */
  async create(data: CreateUserDto): Promise<User> {
    try {
      // Validar se empresa existe
      const company = await this.companyRepository.findById(data.companyId);
      if (!company) {
        throw new AppError('Empresa não encontrada', 404);
      }

      // Validar se email já existe
      const existingUserByEmail = await this.userRepository.findByEmail(data.email);
      const emailExists = !!existingUserByEmail;
      if (emailExists) {
        throw new AppError('Email já está em uso', 409);
      }

      // Hash da senha
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      // Criar usuário
      const user = await this.userRepository.create({
        ...data,
        password: hashedPassword,
      });

      logger.info(`Usuário criado com sucesso: ${user.name} (${user.email})`);

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Erro ao criar usuário: ${error}`);
      throw new AppError('Falha ao criar usuário', 500);
    }
  }

  /**
   * Busca usuário por ID
   * @param id ID do usuário
   * @returns Usuário encontrado
   */
  async findById(id: string): Promise<User & { company: { id: string; name: string; cnpj: string; }; }> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Erro ao buscar usuário: ${error}`);
      throw new AppError('Falha ao buscar usuário', 500);
    }
  }

  /**
   * Busca usuário por email
   * @param email Email do usuário
   * @returns Usuário encontrado
   */
  async findByEmail(email: string): Promise<(User & { company: { id: string; name: string; cnpj: string; }; }) | null> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      logger.error(`Erro ao buscar usuário por email: ${error}`);
      throw new AppError('Falha ao buscar usuário por email', 500);
    }
  }

  /**
   * Lista usuários com filtros e paginação
   * @param filters Filtros de busca
   * @returns Lista paginada de usuários
   */
  async findMany(filters: UserFiltersDto): Promise<UserListResponseDto> {
    try {
      const result = await this.userRepository.findMany(filters);

      return {
        data: result.data,
        total: result.total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(result.total / filters.limit),
      };
    } catch (error) {
      logger.error(`Erro ao listar usuários: ${error}`);
      throw new AppError('Falha ao listar usuários', 500);
    }
  }

  /**
   * Atualiza usuário
   * @param id ID do usuário
   * @param data Dados para atualização
   * @returns Usuário atualizado
   */
  async update(id: string, data: UpdateUserDto): Promise<User> {
    try {
      // Verificar se usuário existe
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Atualizar usuário
      const user = await this.userRepository.update(id, data);

      logger.info(`Usuário atualizado: ${user.name} (${user.email})`);

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Erro ao atualizar usuário: ${error}`);
      throw new AppError('Falha ao atualizar usuário', 500);
    }
  }

  /**
   * Altera senha do usuário
   * @param id ID do usuário
   * @param data Dados da alteração de senha
   * @returns Sucesso da operação
   */
  async changePassword(id: string, data: ChangePasswordDto): Promise<{ message: string }> {
    try {
      // Buscar usuário
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Verificar senha atual
      const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new AppError('Senha atual incorreta', 400);
      }

      // Verificar se nova senha é diferente da atual
      const isSamePassword = await bcrypt.compare(data.newPassword, user.password);
      if (isSamePassword) {
        throw new AppError('A nova senha deve ser diferente da senha atual', 400);
      }

      // Hash da nova senha
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(data.newPassword, saltRounds);

      // Atualizar senha
      await this.userRepository.updatePassword(id, hashedPassword);

      logger.info(`Senha alterada para usuário: ${user.email}`);

      return { message: 'Senha alterada com sucesso' };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Erro ao alterar senha: ${error}`);
      throw new AppError('Falha ao alterar senha', 500);
    }
  }

}