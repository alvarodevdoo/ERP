import { CompanyRepository } from '../repositories';
import { CreateCompanyDto, UpdateCompanyDto, CompanyFiltersDto, CompanyResponseDto, CompanyListResponseDto } from '../dtos';
import { logger } from '../../../shared/logger/index';
import { AppError } from '../../../shared/errors/AppError';
import { validateCNPJ } from '../../../shared/utils/validators';

/**
 * Service para operações de empresa
 * Implementa regras de negócio e validações
 */
export class CompanyService {
  private companyRepository: CompanyRepository;

  constructor(companyRepository?: CompanyRepository) {
    this.companyRepository = companyRepository || new CompanyRepository();
  }

  /**
   * Cria uma nova empresa
   * @param data Dados da empresa
   * @returns Empresa criada
   */
  async create(data: CreateCompanyDto): Promise<CompanyResponseDto> {
    try {
      // Validar CNPJ
      const cleanCnpj = data.cnpj.replace(/[^0-9]/g, '');
      if (!validateCNPJ(cleanCnpj)) {
        throw new AppError('CNPJ inválido', 400);
      }

      // Verificar se CNPJ já existe
      const cnpjExists = await this.companyRepository.documentExists(cleanCnpj);
      if (cnpjExists) {
        throw new AppError('CNPJ já cadastrado', 409);
      }

      // Verificar se email já existe
      const emailExists = await this.companyRepository.emailExists(data.email);
      if (emailExists) {
        throw new AppError('Email já cadastrado', 409);
      }

      // Criar empresa
      const company = await this.companyRepository.create(data);

      logger.info(`Nova empresa criada: ${company.name}`);
      return this.mapToResponseDto(company);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error({ err: error }, 'Erro ao criar empresa');
      throw new AppError('Falha interna ao criar empresa', 500);
    }
  }

  /**
   * Busca empresa por ID
   * @param id ID da empresa
   * @returns Empresa encontrada
   */
  async findById(id: string): Promise<CompanyResponseDto> {
    try {
      const company = await this.companyRepository.findById(id);
      
      if (!company) {
        throw new AppError('Empresa não encontrada', 404);
      }

      return this.mapToResponseDto(company);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error({ err: error }, 'Erro ao buscar empresa');
      throw new AppError('Falha interna ao buscar empresa', 500);
    }
  }

  /**
   * Lista empresas com filtros e paginação
   * @param filters Filtros de busca
   * @returns Lista paginada de empresas
   */
  async findMany(filters: CompanyFiltersDto): Promise<CompanyListResponseDto> {
    try {
      const result = await this.companyRepository.findMany(filters);
      
      const companies = result.data.map(company => this.mapToResponseDto(company));
      
      return {
        data: companies,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / filters.limit),
          hasNext: filters.page < Math.ceil(result.total / filters.limit),
          hasPrev: filters.page > 1,
        },
      };
    } catch (error) {
      logger.error({ err: error }, 'Erro ao listar empresas');
      throw new AppError('Falha interna ao listar empresas', 500);
    }
  }

  /**
   * Atualiza empresa
   * @param id ID da empresa
   * @param data Dados para atualização
   * @returns Empresa atualizada
   */
  async update(id: string, data: UpdateCompanyDto): Promise<CompanyResponseDto> {
    try {
      // Verificar se empresa existe
      const existingCompany = await this.companyRepository.findById(id);
      if (!existingCompany) {
        throw new AppError('Empresa não encontrada', 404);
      }

      // DTO de update não prevê alteração de CNPJ; nenhuma validação de documento necessária

      // Verificar se email já existe (excluindo a empresa atual)
      if (data.email) {
        const emailExists = await this.companyRepository.emailExists(data.email, id);
        if (emailExists) {
          throw new AppError('Email já cadastrado', 409);
        }
      }

      // Atualizar empresa
      const company = await this.companyRepository.update(id, data);

      logger.info(`Empresa atualizada: ${company.name}`);
      return this.mapToResponseDto(company);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error({ err: error }, 'Erro ao atualizar empresa');
      throw new AppError('Falha interna ao atualizar empresa', 500);
    }
  }

  /**
   * Remove empresa (soft delete)
   * @param id ID da empresa
   * @returns Empresa removida
   */
  async delete(id: string): Promise<void> {
    try {
      // Verificar se empresa existe
      const existingCompany = await this.companyRepository.findById(id);
      if (!existingCompany) {
        throw new AppError('Empresa não encontrada', 404);
      }

      // Verificar se empresa tem usuários ativos
      if ((existingCompany as any)._count?.users && (existingCompany as any)._count.users > 0) {
        throw new AppError('Não é possível remover empresa com usuários ativos', 400);
      }

      // Verificar se empresa tem pedidos ativos
      if ((existingCompany as any)._count?.orders && (existingCompany as any)._count.orders > 0) {
        throw new AppError('Não é possível remover empresa com pedidos cadastrados', 400);
      }

      // Remover empresa
      await this.companyRepository.delete(id);

      // 
      logger.info(`Empresa removida: ${existingCompany.name}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error({ err: error }, 'Erro ao remover empresa');
      throw new AppError('Falha interna ao remover empresa', 500);
    }
  }

  /**
   * Restaura empresa removida
   * @param id ID da empresa
   * @returns Empresa restaurada
   */
  async restore(id: string): Promise<CompanyResponseDto> {
    try {
      // Verificar se empresa existe
      const existingCompany = await this.companyRepository.findById(id);
      if (!existingCompany) {
        throw new AppError('Empresa não encontrada', 404);
      }

      // Verificar se empresa está inativa
      if (existingCompany.isActive) {
        throw new AppError('Empresa já está ativa', 400);
      }

      // Restaurar empresa
      const company = await this.companyRepository.restore(id);

      logger.info(`Empresa restaurada: ${company.name}`);
      return this.mapToResponseDto(company);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error({ err: error }, 'Erro ao restaurar empresa');
      throw new AppError('Falha interna ao restaurar empresa', 500);
    }
  }

  /**
   * Busca estatísticas da empresa
   * @param id ID da empresa
   * @returns Estatísticas da empresa
   */
  async getStats(id: string): Promise<{
    totalUsers: number;
    totalEmployees: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    activeOrders: number;
  }> {
    try {
      // Verificar se empresa existe
      const existingCompany = await this.companyRepository.findById(id);
      if (!existingCompany) {
        throw new AppError('Empresa não encontrada', 404);
      }

      return await this.companyRepository.getStats(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error({ err: error }, 'Erro ao buscar estatísticas da empresa');
      throw new AppError('Falha interna ao buscar estatísticas', 500);
    }
  }

  /**
   * Valida documento (CNPJ ou CPF)
   * @param document Documento para validar
   * @returns true se válido, false caso contrário
   */
  // Removida validação genérica de documento; empresas usam apenas CNPJ

  /**
   * Mapeia entidade Company para DTO de resposta
   * @param company Entidade Company
   * @returns DTO de resposta
   */
  private mapToResponseDto(company: any): CompanyResponseDto {
    return {
      id: company.id,
      name: company.name,
      tradeName: company.tradeName || null,
      cnpj: company.cnpj,
      email: company.email,
      phone: company.phone,
      address: company.address,
      city: company.city,
      state: company.state,
      zipCode: company.zipCode,
      description: company.description,
      website: company.website,
      logo: company.logo,
      isActive: company.isActive,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      _count: company._count ? {
        users: company._count.users || 0,
        employees: company._count.employees || 0,
        products: company._count.products || 0,
        orders: company._count.orders || 0,
      } : undefined,
    };
  }
}