import { PrismaClient, Permission, Role, Prisma } from '@prisma/client';

export class RoleRepository {
  constructor(private prisma: PrismaClient) {}

  // Verifica se já existe uma role com o mesmo nome na empresa
  async nameExists(name: string, companyId: string): Promise<boolean> {
    const count = await this.prisma.role.count({
      where: {
        name,
        companyId,
      },
    });
    return count > 0;
  }

  // Cria uma nova role
  async create(data: {
    name: string;
    description?: string | null;
    companyId: string;
    permissionIds: string[];
  }): Promise<Role & { 
    permissions: Permission[]; 
    company: { id: string; name: string; cnpj: string };
    _count: { employees: number };
  }> {
    return this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        company: {
          connect: { id: data.companyId }
        },
        permissions: {
          connect: data.permissionIds.map(id => ({ id }))
        }
      },
      include: {
        permissions: true,
        company: {
          select: {
            id: true,
            name: true,
            cnpj: true
          }
        },
        _count: {
          select: {
            employees: true
          }
        }
      }
    });
  }

  // Retorna todas as permissões ativas do usuário considerando employee -> role -> permissions
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
      },
    });

    const permissions = user?.employee?.role?.permissions || [];
    return permissions.filter(p => p.isActive);
  }

  // Verifica se o usuário possui uma permissão específica
  async userHasPermission(userId: string, permission: string, resource?: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.some(p => {
      if (resource) {
        return p.action === permission && p.resource === resource;
      }
      return p.action === permission || p.name === permission;
    });
  }

  // Busca uma role pelo ID
  async findById(id: string): Promise<Role & { 
    permissions: Permission[]; 
    company: { id: string; name: string; cnpj: string };
    _count: { employees: number };
  } | null> {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        company: {
          select: {
            id: true,
            name: true,
            cnpj: true
          }
        },
        _count: {
          select: {
            employees: true
          }
        }
      }
    });
  }

  // Busca roles com filtros
  async findMany(filters: {
    name?: string;
    companyId?: string;
    permissionId?: string;
    page: number;
    limit: number;
  }): Promise<{
    data: (Role & { 
      permissions: Permission[]; 
      company: { id: string; name: string; cnpj: string };
      _count: { employees: number };
    })[];
    total: number;
  }> {
    const where: Prisma.RoleWhereInput = {};
    
    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' as Prisma.QueryMode };
    }
    
    if (filters.companyId) {
      where.companyId = filters.companyId;
    }
    
    if (filters.permissionId) {
      where.permissions = {
        some: { id: filters.permissionId }
      };
    }
    
    const [data, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        include: {
          permissions: true,
          company: {
            select: {
              id: true,
              name: true,
              cnpj: true
            }
          },
          _count: {
            select: {
              employees: true
            }
          }
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { name: 'asc' }
      }),
      this.prisma.role.count({ where })
    ]);
    
    return { data, total };
  }

  // Atualiza uma role
  async update(id: string, data: {
    name?: string;
    description?: string | null;
    permissionIds?: string[];
  }): Promise<Role & { 
    permissions: Permission[]; 
    company: { id: string; name: string; cnpj: string };
    _count: { employees: number };
  }> {
    const updateData: Prisma.RoleUpdateInput = {};
    
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    
    const role = await this.prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        permissions: true,
        company: {
          select: {
            id: true,
            name: true,
            cnpj: true
          }
        },
        _count: {
          select: {
            employees: true
          }
        }
      }
    });
    
    if (data.permissionIds) {
      // Desconecta todas as permissões existentes
      await this.prisma.role.update({
        where: { id },
        data: {
          permissions: {
            set: []
          }
        }
      });
      
      // Conecta as novas permissões
      await this.prisma.role.update({
        where: { id },
        data: {
          permissions: {
            connect: data.permissionIds.map(id => ({ id }))
          }
        }
      });
      
      // Busca a role atualizada com as novas permissões
      return this.findById(id) as Promise<Role & { 
        permissions: Permission[]; 
        company: { id: string; name: string; cnpj: string };
        _count: { employees: number };
      }>;
    }
    
    return role;
  }

  // Remove uma role
  async delete(id: string): Promise<void> {
    await this.prisma.role.delete({
      where: { id }
    });
  }

  // Obtém estatísticas de roles
  async getStats(companyId?: string): Promise<{
    totalRoles: number;
    activeRoles: number;
    inactiveRoles: number;
    totalPermissions: number;
    activePermissions: number;
    mostUsedRoles: { id: string; name: string; usersCount: number }[];
    recentlyCreated: { id: string; name: string; createdAt: Date }[];
  }> {
    const whereRole: Prisma.RoleWhereInput = {};
    const wherePermission: Prisma.PermissionWhereInput = {};
    
    if (companyId) {
      whereRole.companyId = companyId;
    }
    
    const [
      totalRoles,
      totalPermissions,
      activePermissions,
      mostUsedRoles,
      recentlyCreated
    ] = await Promise.all([
      this.prisma.role.count({ where: whereRole }),
      this.prisma.permission.count({ where: wherePermission }),
      this.prisma.permission.count({ where: { ...wherePermission, isActive: true } }),
      this.prisma.role.findMany({
        where: whereRole,
        include: {
          _count: {
            select: { employees: true }
          }
        },
        orderBy: {
          employees: { _count: 'desc' }
        },
        take: 5
      }),
      this.prisma.role.findMany({
        where: whereRole,
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
    ]);
    
    return {
      totalRoles,
      activeRoles: 0, // Placeholder
      inactiveRoles: 0, // Placeholder
      totalPermissions,
      activePermissions,
      mostUsedRoles: mostUsedRoles.map((role: any) => ({
        id: role.id,
        name: role.name,
        usersCount: role._count.employees
      })),
      recentlyCreated: recentlyCreated.map((role: any) => ({
        id: role.id,
        name: role.name,
        createdAt: role.createdAt
      }))
    };
  }
}
