import { FastifyRequest } from 'fastify';
import { User } from '@artplim/types';

export interface AuthenticatedRequest {
  user: User;
  userId: string;
  params?: any;
  query?: any;
  body?: any;
  headers?: any;
}

// Helper types for typed routes
export type AuthenticatedRequestWithQuery<T> = AuthenticatedRequest & { query: T };
export type AuthenticatedRequestWithParams<T> = AuthenticatedRequest & { params: T };
export type AuthenticatedRequestWithBody<T> = AuthenticatedRequest & { body: T };
export type AuthenticatedRequestWithAll<Q, P, B> = AuthenticatedRequest & { 
  query: Q; 
  params: P; 
  body: B; 
};
