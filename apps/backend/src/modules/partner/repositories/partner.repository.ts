import { PrismaClient, Partner, Prisma, $Enums } from '@prisma/client';
import type { PartnerType } from '@prisma/client';
import { 
  CreatePartnerDTO, 
  UpdatePartnerDTO, 
  PartnerFiltersDTO, 
  PartnerResponseDTO,
  PartnerStatsDTO,
  PartnerReportDTO
} from '../dtos';
import { AppError } from '../../../shared/errors/AppError';

export class PartnerRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Cria um novo parceiro
   */
  async create(data: CreatePartnerDTO, companyId: string): Promise<PartnerResponseDTO> {
    try {
      const createData: Prisma.PartnerCreateInput = {
        name: data.name,
        type: data.type,
        phone: data.phone,
        ...(data.document ? { document: data.document } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        company: { connect: { id: companyId } },
        ...(data.address
          ? { address: JSON.stringify(data.address) }
          : {})
      };

      const partner = await this.prisma.partner.create({
        data: createData,
      });

      return this.formatPartnerResponse(partner);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = (error.meta?.target as string[]) || [];
          if (target.includes('name')) {
            throw new AppError('Já existe um parceiro com este nome', 409);
          }
          if (target.includes('phone')) {
            throw new AppError('Já existe um parceiro com este telefone', 409);
          }
          throw new AppError('Já existe um parceiro com estes dados', 409);
        }
      }
      throw new AppError('Erro ao criar parceiro', 500);
    }
  }

  /**
   * Busca parceiro por ID
   */
  async findById(id: string, companyId: string): Promise<PartnerResponseDTO | null> {
    try {
      const partner = await this.prisma.partner.findFirst({
        where: {
          id,
          companyId,
        }
      });

      return partner ? this.formatPartnerResponse(partner) : null;
    } catch {
      throw new AppError('Erro ao buscar parceiro', 500);
    }
  }

  /**
   * Lista parceiros com filtros e paginação
   */
  async findMany(filters: PartnerFiltersDTO, companyId: string): Promise<{
    partners: PartnerResponseDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const where: Prisma.PartnerWhereInput = {
        companyId,
        ...(filters.search && {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
            { document: { contains: filters.search, mode: 'insensitive' } },
            { phone: { contains: filters.search, mode: 'insensitive' } }
          ]
        }),
        ...(filters.name && {
          name: {
            contains: filters.name,
            mode: 'insensitive'
          }
        }),
        ...(filters.email && {
          email: {
            contains: filters.email,
            mode: 'insensitive'
          }
        }),
        ...(filters.document && {
          document: {
            contains: filters.document,
            mode: 'insensitive'
          }
        }),
        ...(filters.type && { type: filters.type }),
        ...(filters.createdAfter && {
          createdAt: {
            gte: new Date(filters.createdAfter)
          }
        }),
        ...(filters.createdBefore && {
          createdAt: {
            lte: new Date(filters.createdBefore)
          }
        })
      };

      // Filtros de endereço (campo address é string JSON no schema atual)
      if (filters.city || filters.state) {
        where.AND = [
          ...(filters.city ? [{ address: { contains: filters.city } }] : []),
          ...(filters.state ? [{ address: { contains: filters.state } }] : [])
        ];
      }

      const [partners, total] = await Promise.all([
        this.prisma.partner.findMany({
          where,
          orderBy: {
            [filters.sortBy]: filters.sortOrder
          },
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit
        }),
        this.prisma.partner.count({ where })
      ]);

      return {
        partners: partners.map(partner => this.formatPartnerResponse(partner)),
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit)
      };
    } catch (error) {
      console.error('Error in findMany:', error);
      throw new AppError('Erro ao listar parceiros', 500);
    }
  }

  /**
   * Atualiza parceiro
   */
  async update(id: string, data: UpdatePartnerDTO, companyId: string): Promise<PartnerResponseDTO> {
    try {
      const updateData: Prisma.PartnerUpdateInput = {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.document !== undefined ? { document: data.document } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.address !== undefined
          ? { address: data.address ? JSON.stringify(data.address) : null }
          : {}),
        updatedAt: new Date()
      };

      const partner = await this.prisma.partner.update({
        where: { id },
        data: updateData,
      });

      return this.formatPartnerResponse(partner);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new AppError('Parceiro não encontrado', 404);
        }
        if (error.code === 'P2002') {
          throw new AppError('Já existe um parceiro com este documento', 409);
        }
      }
      throw new AppError('Erro ao atualizar parceiro', 500);
    }
  }

  /**
   * Atualiza status ativo/inativo do parceiro
   */
  async updateStatus(id: string, isActive: boolean, _companyId: string): Promise<PartnerResponseDTO> {
    try {
      const partner = await this.prisma.partner.update({
        where: { id },
        data: {
          isActive,
          updatedAt: new Date()
        }
      });

      return this.formatPartnerResponse(partner);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Parceiro não encontrado', 404);
      }
      throw new AppError('Erro ao atualizar status do parceiro', 500);
    }
  }

  /**
   * Remove parceiro (soft delete)
   */
  async delete(id: string, companyId: string): Promise<void> {
    try {
      await this.prisma.partner.update({
        where: { id },
        data: { isActive: false }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new AppError('Parceiro não encontrado', 404);
        }
      }
      throw new AppError('Erro ao excluir parceiro', 500);
    }
  }

  /**
   * Restaura parceiro
   */
  async restore(id: string, companyId: string): Promise<PartnerResponseDTO> {
    try {
      const partner = await this.prisma.partner.update({
        where: { id },
        data: { isActive: true, updatedAt: new Date() }
      });

      return this.formatPartnerResponse(partner);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new AppError('Parceiro não encontrado', 404);
        }
      }
      throw new AppError('Erro ao restaurar parceiro', 500);
    }
  }

  /**
   * Verifica se nome já existe
   */
  async nameExists(name: string, companyId: string, excludeId?: string): Promise<boolean> {
    try {
      const partner = await this.prisma.partner.findFirst({
        where: {
          name,
          companyId,
          ...(excludeId && { id: { not: excludeId } })
        }
      });

      return !!partner;
    } catch {
      throw new AppError('Erro ao verificar nome', 500);
    }
  }

  /**
   * Verifica se telefone já existe
   */
  async phoneExists(phone: string, companyId: string, excludeId?: string): Promise<boolean> {
    try {
      const partner = await this.prisma.partner.findFirst({
        where: {
          phone,
          companyId,
          ...(excludeId && { id: { not: excludeId } })
        }
      });

      return !!partner;
    } catch {
      throw new AppError('Erro ao verificar telefone', 500);
    }
  }

  /**
   * Verifica se documento já existe
   */
  async documentExists(document: string, companyId: string, excludeId?: string): Promise<boolean> {
    try {
      const partner = await this.prisma.partner.findFirst({
        where: {
          document,
          companyId,
          ...(excludeId && { id: { not: excludeId } })
        }
      });

      return !!partner;
    } catch {
      throw new AppError('Erro ao verificar documento', 500);
    }
  }

  /**
   * Busca parceiros por tipo
   */
  async findByType(type: PartnerType, companyId: string): Promise<PartnerResponseDTO[]> {
    try {
      const partners = await this.prisma.partner.findMany({
        where: {
          type,
          companyId,
          isActive: true
        },
        orderBy: {
          name: 'asc'
        }
      });

      return partners.map(partner => this.formatPartnerResponse(partner));
    } catch {
      throw new AppError('Erro ao buscar parceiros por tipo', 500);
    }
  }

  /**
   * Obtém estatísticas dos parceiros
   */
  async getStats(companyId: string): Promise<PartnerStatsDTO> {
    try {
      const [
        total,
        active,
        inactive,
        customers,
        suppliers,
        both,
        topCustomers,
        topSuppliers
      ] = await Promise.all([
        this.prisma.partner.count({ where: { companyId } }),
        this.prisma.partner.count({ where: { companyId, isActive: true } }),
        this.prisma.partner.count({ where: { companyId, isActive: false } }),
        this.prisma.partner.count({ where: { companyId, type: $Enums.PartnerType.CUSTOMER } }),
        this.prisma.partner.count({ where: { companyId, type: $Enums.PartnerType.SUPPLIER } }),
        this.prisma.partner.count({ where: { companyId, type: $Enums.PartnerType.BOTH } }),
        // Top customers (simulado - seria baseado em pedidos)
        this.prisma.partner.findMany({
          where: {
            type: { in: [$Enums.PartnerType.CUSTOMER, $Enums.PartnerType.BOTH] },
            companyId,
            isActive: true
          },
          select: {
            id: true,
            name: true
          },
          take: 5,
          orderBy: {
            name: 'asc'
          }
        }),
        // Top suppliers (simulado - seria baseado em compras)
        this.prisma.partner.findMany({
          where: {
            type: { in: [$Enums.PartnerType.SUPPLIER, $Enums.PartnerType.BOTH] },
            companyId,
            isActive: true
          },
          select: {
            id: true,
            name: true
          },
          take: 5,
          orderBy: {
            name: 'asc'
          }
        })
      ]);

      const result: PartnerStatsDTO = {
        total,
        active,
        inactive,
        blocked: 0,
        customers,
        suppliers,
        both,
        totalCreditLimit: 0,
        averageCreditLimit: 0,
        topCustomers: topCustomers.map(c => ({
          id: c.id,
          name: c.name,
          totalOrders: 0, // Seria calculado com base nos pedidos
          totalValue: 0   // Seria calculado com base nos pedidos
        })),
        topSuppliers: topSuppliers.map(s => ({
          id: s.id,
          name: s.name,
          totalPurchases: 0, // Seria calculado com base nas compras
          totalValue: 0      // Seria calculado com base nas compras
        }))
      };

      // Campo creditLimit removido do schema; manter acumulado como 0
      result.averageCreditLimit = result.total > 0 ? result.totalCreditLimit / result.total : 0;

      return result;
    } catch {
      throw new AppError('Erro ao obter estatísticas', 500);
    }
  }

  /**
   * Busca parceiros para relatório
   */
  async findForReport(filters: PartnerFiltersDTO, companyId: string): Promise<PartnerReportDTO[]> {
    try {
      const where: Prisma.PartnerWhereInput = {
        companyId,
        ...(filters.type && { type: filters.type }),
        ...(filters.createdAfter && {
          createdAt: {
            gte: new Date(filters.createdAfter)
          }
        }),
        ...(filters.createdBefore && {
          createdAt: {
            lte: new Date(filters.createdBefore)
          }
        })
      };

      const partners = await this.prisma.partner.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          document: true,
          type: true,
          isActive: true,
          address: true,
          createdAt: true
        },
        orderBy: {
          name: 'asc'
        }
      });

      return partners.map(partner => {
        const address = partner.address ? JSON.parse(partner.address as string) : null;
        const report: PartnerReportDTO = {
          id: partner.id,
          name: partner.name,
          email: partner.email ?? '',
          phone: partner.phone ?? '',
          document: partner.document ?? '',
          type: String(partner.type),
          isActive: partner.isActive,
          city: address?.city ?? '',
          state: address?.state ?? '',
          // Campo creditLimit removido do schema
          creditLimit: 0,
          totalOrders: 0,    // Seria calculado com base nos pedidos
          totalValue: 0,     // Seria calculado com base nos pedidos
          createdAt: partner.createdAt
        };
        // Não incluir lastOrderDate quando não definido para compatibilidade com exactOptionalPropertyTypes
        return report;
      });
    } catch {
      throw new AppError('Erro ao gerar relatório', 500);
    }
  }

  /**
   * Formata resposta do parceiro
   */
  private formatPartnerResponse(partner: Partner): PartnerResponseDTO {
    let address;
    try {
      address = partner.address ? JSON.parse(partner.address as string) : undefined;
    } catch {
      address = undefined;
    }
    
    return {
      id: partner.id,
      name: partner.name,
      email: partner.email ?? '',
      phone: partner.phone ?? '',
      document: partner.document ?? '',
      type: partner.type,
      isActive: partner.isActive,
      notes: partner.notes || '',
      address,
      creditLimit: 0,
      paymentTerms: '', // Empty string instead of null since paymentTerms expects string type
      // Campos não presentes no schema atual; valores padrão
      salesRepresentative: '',
      discount: 0,
      metadata: {},
      contacts: [],
      companyId: partner.companyId,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
      // Campo deletedAt não presente no schema atual
    };
  }
}