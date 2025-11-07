import { RoleRepository } from '../repositories/role.repository';
import { CreateRoleDto, UpdateRoleDto, RoleFiltersDto, CheckPermissionDto } from '../dtos';
import { AppError } from '../../../shared/errors/AppError';
import { Permission, Role } from '@prisma/client';

export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async create(data: CreateRoleDto): Promise<Role & { 
    permissions: Permission[]; 
    company: { id: string; name: string; cnpj: string };
    _count: { employees: number };
  }> {
    const nameExists = await this.roleRepository.nameExists(data.name, data.companyId);
    if (nameExists) {
      throw new AppError('Já existe uma role com este nome na empresa.', 400);
    }
    // Remove isActive from data before passing to repository
    const { isActive, ...rest } = data;
    return this.roleRepository.create(rest);
  }

  async findById(id: string): Promise<Role & { 
    permissions: Permission[]; 
    company: { id: string; name: string; cnpj: string };
    _count: { employees: number };
  }> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new AppError('Role não encontrada.', 404);
    }
    return role;
  }

  async findMany(filters: RoleFiltersDto) {
    // Remove isActive from filters before passing to repository
    const { isActive, ...rest } = filters;
    const result = await this.roleRepository.findMany(rest);
    return {
      ...result,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(result.total / filters.limit),
    };
  }

  async update(id: string, data: UpdateRoleDto): Promise<Role & { 
    permissions: Permission[]; 
    company: { id: string; name: string; cnpj: string };
    _count: { employees: number };
  }> {
    await this.findById(id); // acheck if role exists
    // Remove isActive from data before passing to repository
    const { isActive, ...rest } = data;
    return this.roleRepository.update(id, rest);
  }

  async delete(id: string): Promise<void> {
    const role = await this.findById(id);
    if (role._count.employees > 0) {
      throw new AppError('Não é possível excluir uma role que está sendo utilizada por funcionários.', 400);
    }
    await this.roleRepository.delete(id);
  }

  async checkPermission(data: CheckPermissionDto): Promise<boolean> {
    return this.roleRepository.userHasPermission(data.userId, data.permission, data.resource);
  }

  async assignRolesToUser(data: { userId: string; roleIds: string[] }): Promise<void> {
    // TODO: Implement logic to update employee's roleId. 
    // This requires interacting with the Employee repository/service.
    // For now, this is a placeholder to allow compilation.
    console.log('Assigning roles', data);
    await Promise.resolve();
  }

  async removeRolesFromUser(data: { userId: string; roleIds: string[] }): Promise<void> {
    // TODO: Implement logic to update employee's roleId to a default or null.
    // This requires interacting with the Employee repository/service.
    // For now, this is a placeholder to allow compilation.
    console.log('Removing roles', data);
    await Promise.resolve();
  }

  async getStats(companyId?: string) {
    return this.roleRepository.getStats(companyId);
  }
}
