import type { PrismaClient, Prisma } from '@prisma/client';

export type PrismaMockOptions = {
  entries?: any[];
};

/**
 * createMockPrisma: retorna um PrismaClient mockado cobrindo os casos usados hoje,
 * com possibilidade de sobrescrever comportamentos por teste.
 */
export function createMockPrisma(
  options: PrismaMockOptions = {},
  overrides: Partial<PrismaClient> = {}
): PrismaClient {
  const now = new Date();
  const entries = options.entries ?? [];

  const base = {
    financialEntry: {
      findMany: async (_args?: any) => entries,
      findFirst: async (_args?: any) => entries[0] ?? null,
      create: async ({ data }: any) => ({
        id: data?.id ?? 'tx_1',
        ...data,
        createdAt: now,
        updatedAt: now,
      }),
      update: async ({ where, data }: any) => ({
        id: where?.id ?? 'tx_1',
        ...data,
        createdAt: now,
        updatedAt: now,
      }),
      delete: async (_args: any) => undefined,
      count: async (_args?: any) => entries.length,
    },
    financialCategory: {
      findFirst: async (_args?: any) => null,
      count: async (_args?: any) => 0,
    },
    financialAccount: {
      findFirst: async (_args?: any) => null,
      count: async (_args?: any) => 0,
    },
    financialTransfer: {
      count: async (_args?: any) => 0,
    },
    $transaction: async (fn: (tx: Prisma.TransactionClient) => any) => {
      const txClient = {
        financialEntry: {
          create: async ({ data }: any) => ({
            id: data?.id ?? 'tx_1',
            ...data,
            createdAt: now,
            updatedAt: now,
          }),
          delete: async (_args: any) => undefined,
        },
      } as unknown as Prisma.TransactionClient;
      return fn(txClient);
    },
  } as any;

  const prisma = { ...base, ...overrides };
  return prisma as unknown as PrismaClient;
}