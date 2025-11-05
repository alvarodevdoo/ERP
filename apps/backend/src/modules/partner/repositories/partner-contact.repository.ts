import { PrismaClient, Prisma } from '@prisma/client';
import { 
  CreatePartnerContactDTO, 
  UpdatePartnerContactDTO, 
  PartnerContactResponseDTO
} from '../dtos';
import { AppError } from '../../../shared/errors/AppError';

export class PartnerContactRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Cria um novo contato do parceiro
   */
  async create(data: CreatePartnerContactDTO, companyId: string): Promise<PartnerContactResponseDTO> {
    try {
      // Verifica se o parceiro existe e pertence à empresa
      const partner = await this.prisma.partner.findFirst({
        where: {
          id: data.partnerId,
          companyId,
          // deletedAt não existe no schema atual
        }
      });

      if (!partner) {
        throw new AppError('Parceiro não encontrado', 404);
      }
      // Como PartnerContact não existe no schema, retornar erro explícito
      throw new AppError('Gerenciamento de contatos não suportado no schema atual', 501);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao criar contato', 500);
    }
  }

  /**
   * Busca contato por ID
   */
  async findById(id: string, companyId: string): Promise<PartnerContactResponseDTO | null> {
    try {
      // Não suportado no schema atual
      throw new AppError('Gerenciamento de contatos não suportado no schema atual', 501);
    } catch (_error) {
      throw new AppError('Erro ao buscar contato', 500);
    }
  }

  /**
   * Lista contatos de um parceiro
   */
  async findByPartnerId(partnerId: string, companyId: string): Promise<PartnerContactResponseDTO[]> {
    try {
      // Verifica se o parceiro existe e pertence à empresa
      const partner = await this.prisma.partner.findFirst({
        where: {
          id: partnerId,
          companyId,
          // deletedAt não existe no schema atual
        }
      });

      if (!partner) {
        throw new AppError('Parceiro não encontrado', 404);
      }
      // Não suportado no schema atual
      return [];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao listar contatos', 500);
    }
  }

  /**
   * Atualiza contato
   */
  async update(id: string, data: UpdatePartnerContactDTO, companyId: string): Promise<PartnerContactResponseDTO> {
    try {
      // Não suportado no schema atual
      throw new AppError('Gerenciamento de contatos não suportado no schema atual', 501);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao atualizar contato', 500);
    }
  }

  /**
   * Remove contato
   */
  async delete(id: string, companyId: string): Promise<void> {
    try {
      // Não suportado no schema atual
      throw new AppError('Gerenciamento de contatos não suportado no schema atual', 501);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao excluir contato', 500);
    }
  }

  /**
   * Define contato como primário
   */
  async setPrimary(id: string, companyId: string): Promise<PartnerContactResponseDTO> {
    try {
      // Não suportado no schema atual
      throw new AppError('Gerenciamento de contatos não suportado no schema atual', 501);
    } catch (_error) {
      if (_error instanceof AppError) {
        throw _error;
      }
      throw new AppError('Erro ao definir contato primário', 500);
    }
  }

  /**
   * Busca contato primário de um parceiro
   */
  async findPrimaryByPartnerId(partnerId: string, companyId: string): Promise<PartnerContactResponseDTO | null> {
    try {
      // Verifica se o parceiro existe e pertence à empresa
      const partner = await this.prisma.partner.findFirst({
        where: {
          id: partnerId,
          companyId,
          // deletedAt não existe no schema atual
        }
      });

      if (!partner) {
        throw new AppError('Parceiro não encontrado', 404);
      }
      // Não suportado no schema atual
      return null;
    } catch (_error) {
      if (_error instanceof AppError) {
        throw _error;
      }
      throw new AppError('Erro ao buscar contato primário', 500);
    }
  }

  /**
   * Verifica se email já existe para o parceiro
   */
  async emailExists(email: string, partnerId: string, excludeId?: string): Promise<boolean> {
    try {
      // Não suportado no schema atual
      return false;
    } catch (_error) {
      throw new AppError('Erro ao verificar email', 500);
    }
  }

  /**
   * Formata resposta do contato
   */
  private formatContactResponse(_contact: any): PartnerContactResponseDTO {
    // Método legado não suportado no schema atual
    throw new AppError('Gerenciamento de contatos não suportado no schema atual', 501);
  }
}