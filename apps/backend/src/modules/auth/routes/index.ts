import { FastifyInstance, FastifyRequest } from 'fastify';
import { AuthService } from '../services/auth.service';
import {
  loginDto,
  registerDto,
  refreshTokenDto,
  forgotPasswordDto,
  resetPasswordDto,
  changePasswordDto,
  updateProfileDto,
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from '../dtos';
import { toJsonSchema } from '../../../shared/utils/zod-to-json-schema';
import { createValidation } from '../../../shared/middlewares/validation';

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService(fastify.prisma);

  // Login
  fastify.post(
    '/login',
    {
      schema: { 
        tags: ['Auth'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
          }
        }
      },
    },
    async (request: FastifyRequest<{ Body: LoginDto }>, reply) => {
      try {
        const result = await authService.login(request.body);
        return reply.send(result);
      } catch (error) {
        return reply.status(401).send({
          error: 'Authentication Failed',
          message: error instanceof Error ? error.message : 'Login failed',
        });
      }
    },
  );

  // Register
  fastify.post(
    '/register',
    {
      schema: { tags: ['Auth'], body: toJsonSchema(registerDto) },
    },
    async (request: FastifyRequest<{ Body: RegisterDto }>, reply) => {
      try {
        const result = await authService.register(request.body);
        return reply.status(201).send(result);
      } catch (error) {
        return reply.status(400).send({
          error: 'Registration Failed',
          message:
            error instanceof Error ? error.message : 'Registration failed',
        });
      }
    },
  );

  // Refresh token
  fastify.post(
    '/refresh',
    {
      schema: { tags: ['Auth'], body: toJsonSchema(refreshTokenDto) },
    },
    async (request: FastifyRequest<{ Body: RefreshTokenDto }>, reply) => {
      try {
        const result = await authService.refreshToken(request.body);
        return reply.send(result);
      } catch (error) {
        return reply.status(401).send({
          error: 'Token Refresh Failed',
          message:
            error instanceof Error ? error.message : 'Token refresh failed',
        });
      }
    },
  );

  // Forgot password
  fastify.post(
    '/forgot-password',
    {
      schema: { tags: ['Auth'], body: toJsonSchema(forgotPasswordDto) },
    },
    async (request: FastifyRequest<{ Body: ForgotPasswordDto }>, reply) => {
      try {
        await authService.forgotPassword(request.body);
        return reply.send({
          message: 'If the email exists, a password reset link has been sent',
        });
      } catch (_error) {
        return reply.status(500).send({
          error: 'Password Reset Failed',
          message: 'Unable to process password reset request',
        });
      }
    },
  );

  // Reset password
  fastify.post(
    '/reset-password',
    {
      schema: { tags: ['Auth'], body: toJsonSchema(resetPasswordDto) },
    },
    async (request: FastifyRequest<{ Body: ResetPasswordDto }>, reply) => {
      try {
        await authService.resetPassword(request.body);
        return reply.send({
          message: 'Password has been reset successfully',
        });
      } catch (error) {
        return reply.status(400).send({
          error: 'Password Reset Failed',
          message:
            error instanceof Error ? error.message : 'Password reset failed',
        });
      }
    },
  );

  // Change password (authenticated)
  fastify.post(
    '/change-password',
    {
      schema: { tags: ['Auth'], body: toJsonSchema(changePasswordDto) },
    },
    async (request: FastifyRequest<{ Body: ChangePasswordDto }>, reply) => {
      try {
        if (!request.userId) {
          return reply.status(401).send({
            error: 'Authentication Required',
            message: 'You must be logged in to change password',
          });
        }

        await authService.changePassword(request.userId, request.body);
        return reply.send({
          message: 'Password changed successfully',
        });
      } catch (error) {
        return reply.status(400).send({
          error: 'Password Change Failed',
          message:
            error instanceof Error ? error.message : 'Password change failed',
        });
      }
    },
  );

  // Update profile (authenticated)
  fastify.put(
    '/profile',
    {
      schema: { tags: ['Auth'], body: toJsonSchema(updateProfileDto) },
    },
    async (request: FastifyRequest<{ Body: UpdateProfileDto }>, reply) => {
      try {
        if (!request.userId) {
          return reply.status(401).send({
            error: 'Authentication Required',
            message: 'You must be logged in to update profile',
          });
        }

        //
        const user = await authService.updateProfile(
          request.userId,
          request.body,
        );
        return reply.send({
          message: 'Profile updated successfully',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        });
      } catch (error) {
        return reply.status(400).send({
          error: 'Profile Update Failed',
          message:
            error instanceof Error ? error.message : 'Profile update failed',
        });
      }
    },
  );

  // Get current user (authenticated)
  fastify.get(
    '/me',
    {
      schema: { 
        tags: ['Auth']
      },
    },
    async (request, reply) => {
      try {
        if (!request.user) {
          return reply.status(401).send({
            error: 'Authentication Required',
            message: 'You must be logged in to access this resource',
          });
        }

        // A resposta será serializada automaticamente com base no meResponseDto
        return reply.send({ user: request.user });

      } catch (_error) {
        return reply.status(500).send({
          error: 'User Fetch Failed',
          message: 'Unable to fetch user information',
        });
      }
    },
  );

  // Logout (authenticated)
  fastify.post(
    '/logout',
    {
      schema: { tags: ['Auth'] },
    },
    async (request, reply) => {
      try {
        // In a real implementation, you might want to blacklist the token
        // For now, we'll just return a success message
        return reply.send({
          message: 'Logged out successfully',
        });
      } catch (_error) {
        return reply.status(500).send({
          error: 'Logout Failed',
          message: 'Unable to logout',
        });
      }
    },
  );
}