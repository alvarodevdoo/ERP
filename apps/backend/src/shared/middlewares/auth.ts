import { FastifyInstance, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { prisma } from '../../database/client';
import { Prisma } from '@prisma/client';

// Definir o objeto de inclusão para o Prisma
const userInclude = {
  include: {
    company: true,
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
};

// Inferir o tipo do usuário com base no objeto de inclusão
type PrismaUserWithRelations = Prisma.UserGetPayload<typeof userInclude>;

// Definir o tipo para Role com Permissions
type RoleWithPermissions = Prisma.RoleGetPayload<typeof userInclude.include.employee.include.role>;

// O tipo AuthenticatedUser é o tipo inferido pelo Prisma com as relações
type AuthenticatedUser = PrismaUserWithRelations;

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
    userId?: string;
  }
}

interface JwtPayload {
  userId: string;
  companyId: string;
  iat: number;
  exp: number;
}

export async function authMiddleware(fastify: FastifyInstance) {
  fastify.decorateRequest('user', undefined);
  fastify.decorateRequest('userId', undefined);

  fastify.addHook('preHandler', async (request: FastifyRequest) => {
    // Skip auth for public routes
    const publicRoutes = [
      '/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
    ];

    if (publicRoutes.includes(request.url)) {
      return;
    }

    // Extract token from Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw fastify.httpErrors.unauthorized('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
      
      // Verificar se o token está expirado
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        throw fastify.httpErrors.unauthorized('Token expirado');
      }
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        ...userInclude,
      });

      if (!user) {
        throw fastify.httpErrors.unauthorized('User not found');
      }

      if (!user.isActive) {
        throw fastify.httpErrors.unauthorized('User account is inactive');
      }

      // Attach user to request
      request.user = user as AuthenticatedUser; // Cast para AuthenticatedUser
      request.userId = user.id;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw fastify.httpErrors.unauthorized('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw fastify.httpErrors.unauthorized('Token expired');
      }
      throw error;
    }
  });
}

// Helper function to check if user has permission
export function hasPermission(user: AuthenticatedUser, permission: string): boolean {
  const perms = user.employee?.role?.permissions ?? [];
  return perms.some(p => p.name === permission);
}

// Helper function to check if user has role
export function hasRole(user: AuthenticatedUser, roleName: string): boolean {
  const role = user.employee?.role;
  return !!role && role.name === roleName;
}

// Decorator for route-level permission checking
export function requirePermission(permission: string) {
  return async (request: FastifyRequest) => {
    if (!request.user) {
      throw request.server.httpErrors.unauthorized('Authentication required');
    }

    if (!hasPermission(request.user, permission)) {
      throw request.server.httpErrors.forbidden('Insufficient permissions');
    }
  };
}

// Decorator for route-level role checking
export function requireRole(roleName: string) {
  return async (request: FastifyRequest) => {
    if (!request.user) {
      throw request.server.httpErrors.unauthorized('Authentication required');
    }

    if (!hasRole(request.user, roleName)) {
      throw request.server.httpErrors.forbidden('Insufficient role');
    }
  };
}