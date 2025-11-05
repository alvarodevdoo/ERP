# Test Utils — Mocks Compartilhados

Este diretório contém utilitários de mock compartilhados para testes do backend, padronizando e reduzindo repetição de código em diferentes suítes.

## Visão Geral

- `createMockPrisma`: fábrica de `PrismaClient` mockado com comportamentos padrão e pontos de extensão por teste.
- `mockRoleServiceFactory`: fábrica de mock para `RoleService`, configurável por teste para diferentes cenários de permissão.

## Objetivos

- Cobrir os casos de uso atuais nos testes.
- Ser facilmente extensível para novos cenários.
- Manter consistência entre suítes de teste.
- Minimizar repetição de código.

## Exemplos de Uso

### Prisma

```ts
// apps/backend/src/modules/financial/__tests__/financial.service.spec.ts
import { createMockPrisma } from '../../test-utils/prismaMock';

const prisma = createMockPrisma({
  overrides: {
    // Sobrescrever comportamento em um teste específico
    financialEntry: {
      create: vi.fn().mockResolvedValue({
        id: 'entry_1',
        description: 'Parcela 1/3',
        amount: 100,
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
  },
});

// Usando prisma.$transaction em serviços/repositórios
await prisma.$transaction(async (tx) => {
  await tx.financialEntry.create({ data: { /* ... */ } });
});
```

### RoleService

```ts
// apps/backend/src/modules/financial/__tests__/financial.service.spec.ts
import { mockRoleServiceFactory } from '../../test-utils/roleServiceMock';

vi.mock('../../role/role.service', () => mockRoleServiceFactory({
  checkPermission: vi.fn().mockResolvedValue(true),
}));

// Em outro teste
vi.mock('../../role/role.service', () => mockRoleServiceFactory({
  checkPermission: vi.fn().mockResolvedValue(false),
}));
```

## Guia de Extensão

- Adicione novos modelos no retorno padrão de `createMockPrisma` conforme surgirem cenários.
- Prefira sobrescrever métodos via `overrides` por teste em vez de alterar o mock padrão.
- Para transações, todos os modelos disponíveis em `prisma` também existem em `tx` dentro de `$transaction`.
- Mantenha `createdAt` e `updatedAt` presentes quando o mapeamento de resposta usa `toISOString()`.

## Boas Práticas

- Retornos dos mocks devem respeitar as interfaces originais (tipos do Prisma).
- Evite acoplamento a estruturas internas de objetos retornados em testes — valide campos essenciais.
- Escreva testes de erro e casos limite (ex.: falhas de permissão; falhas de criação em transação).
- Use `vi.clearAllMocks()`/`vi.resetAllMocks()` entre testes quando sobrescrever comportamentos.

## Padrões de Implementação

- `createMockPrisma` retorna um objeto compatível com `PrismaClient` e propaga os mesmos métodos em `tx`.
- `mockRoleServiceFactory` é uma fábrica para `vi.mock`, garantindo que a classe mockada é definida dentro da função (evita problemas de hoisting).
- Exporte funções utilitárias de forma estável e adicione comentários sucintos no topo dos arquivos.

## Validação

- Rode `npx tsc --noEmit` para verificar compatibilidade de tipos.
- Execute a suíte de testes para confirmar que os mocks atendem aos casos de uso atuais.