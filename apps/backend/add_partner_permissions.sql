-- Adicionar permissões de partners
-- Execute este script no banco de dados

-- Criar permissões de partners
INSERT INTO permissions (id, name, description, action, resource, "isActive", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'Criar Parceiros', 'Permite criar novos parceiros', 'create', 'partners', true, NOW(), NOW()),
  (gen_random_uuid(), 'Listar Parceiros', 'Permite visualizar parceiros', 'read', 'partners', true, NOW(), NOW()),
  (gen_random_uuid(), 'Atualizar Parceiros', 'Permite atualizar parceiros', 'update', 'partners', true, NOW(), NOW()),
  (gen_random_uuid(), 'Excluir Parceiros', 'Permite excluir parceiros', 'delete', 'partners', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Associar permissões a TODOS os roles
INSERT INTO "_PermissionToRole" ("A", "B")
SELECT p.id, r.id
FROM permissions p
CROSS JOIN roles r
WHERE p.resource = 'partners'
ON CONFLICT DO NOTHING;
