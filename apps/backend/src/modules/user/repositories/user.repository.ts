import { PrismaClient, User, Prisma } from '@prisma/client';
import { prisma } from '../../../database/connection';
import { logger } from '../../../shared/logger/index';
import { CreateUserDto, UpdateUserDto, UserFiltersDto } from '../dtos';

/**
 * Repositório para operações de usuário
 * Implementa o padrão Repository para isolamento da camada de dados
 */
export class UserRepository {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  /**
   * Cria um novo usuário com roles
   * @param data Dados do usuário
   * @returns Usuário criado
   */
  async create(data: CreateUserDto): Promise<User> {
    try {
      const user = await this.db.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
          companyId: data.companyId,
          isActive: data.isActive,
        },
      });

      logger.info(`Usuário criado: ${user.name} (${user.email})`);
      return user;
    } catch (error) {
      logger.error({ err: error }, 'Erro ao criar usuário:');
      throw new Error('Falha ao criar usuário');
    }
  }

  /**
   * Busca usuário por ID com relacionamentos
   * @param id ID do usuário
   * @returns Usuário encontrado ou null
   */
  async findById(id: string): Promise<(User & { company: { id: string; name: string; cnpj: string } }) | null> {
    try {
      const user = await this.db.user.findUnique({
        where: { id },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              cnpj: true,
            },
          },
        },
      });

      if (!user) return null;

      return user;
    } catch (error) {
      logger.error({ err: error }, 'Erro ao buscar usuário por ID:');
      throw new Error('Falha ao buscar usuário');
    }
  }

  /**
   * Busca usuário por email
   * @param email Email do usuário
   * @returns Usuário encontrado ou null
   */
  async findByEmail(email: string): Promise<(User & { company: { id: string; name: string; cnpj: string } }) | null> {
    try {
      const user = await this.db.user.findUnique({
        where: { email },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              cnpj: true,
            },
          },
        },
      });

      if (!user) return null;

      return user;
    } catch (error) {
      logger.error({ err: error }, 'Erro ao buscar usuário por email:');
      throw new Error('Falha ao buscar usuário por email');
    }
  }

  /**
   * Lista usuários com filtros e paginação
   * @param filters Filtros de busca
   * @returns Lista paginada de usuários
   */
  async findMany(filters: UserFiltersDto): Promise<{
    data: (User & {
      company: { id: string; name: string; cnpj: string };
    })[];
    total: number;
  }> {
    try {
      const {
        name,
        email,
        companyId,
        isActive,
        page,
        limit,
        sortBy,
        sortOrder,
      } = filters;

      // Construir filtros WHERE
      const where: Prisma.UserWhereInput = {};

      if (name) {
        where.name = {
          contains: name,
          mode: 'insensitive',
        };
      }

      if (email) {
        where.email = {
          contains: email,
          mode: 'insensitive',
        };
      }

      if (companyId) {
        where.companyId = companyId;
      }

      if (typeof isActive === 'boolean') {
        where.isActive = isActive;
      }

      // Configurar ordenação
      const orderBy: Prisma.UserOrderByWithRelationInput = {
        [sortBy]: sortOrder,
      };

      // Calcular offset para paginação
      const skip = (page - 1) * limit;

      // Buscar usuários e total
      const [users, total] = await Promise.all([
        this.db.user.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            company: {
              select: {
                id: true,
                name: true,
                cnpj: true,
              },
            },
          },
        }),
        this.db.user.count({ where }),
      ]);

      return { data: users, total };
    } catch (error) {
      logger.error({ err: error }, 'Erro ao listar usuários:');
      throw new Error('Falha ao listar usuários');
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
      const user = await this.db.user.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.email !== undefined && { email: data.email }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });

      logger.info(`Usuário atualizado: ${user.name} (${user.email})`);
      return user;
    } catch (error) {
      logger.error({ err: error }, 'Erro ao atualizar usuário:');
      throw new Error('Falha ao atualizar usuário');
    }
  }

  /**
   * Atualiza senha do usuário
   * @param id ID do usuário
   * @param hashedPassword Nova senha hasheada
   * @returns Usuário atualizado
   */
  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    try {
      const user = await this.db.user.update({
        where: { id },
        data: {
          password: hashedPassword,
        },
      });

      logger.info(`Senha atualizada para usuário: ${user.email}`);
      return user;
    } catch (error) {
      logger.error({ err: error }, 'Erro ao atualizar senha:');
      throw new Error('Falha ao atualizar senha');
    }
  }

}