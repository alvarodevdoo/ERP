import type { PrismaClient } from '@prisma/client';

/**
 * Fabrica um objeto para ser usado no vi.mock do módulo RoleService,
 * permitindo configurar o retorno de checkPermission por teste.
 */
export function mockRoleServiceFactory(hasPermission = true) {
  return {
    RoleService: class {
      constructor(_prisma: PrismaClient) {}
      async checkPermission(_args?: any) {
        return hasPermission;
      }
    },
  };
}