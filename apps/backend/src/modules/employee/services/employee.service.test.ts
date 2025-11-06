import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployeeService } from './employee.service';
import { EmployeeRepository } from '../repositories';
import { RoleService } from '../../role/services';
import { AppError } from '../../../shared/errors/AppError';

// Mock dos repositórios
vi.mock('../repositories', () => {
  class EmployeeRepositoryMock {
    findAll = vi.fn();
    findMany = vi.fn();
    findById = vi.fn();
    create = vi.fn();
    update = vi.fn();
    delete = vi.fn();
    cpfExists = vi.fn();
    emailExists = vi.fn();
  }
  return { EmployeeRepository: EmployeeRepositoryMock };
});

vi.mock('../../role/services', () => {
  class RoleServiceMock {
    validatePermission = vi.fn().mockResolvedValue(true);
    checkPermission = vi.fn().mockResolvedValue(true);
  }
  return { RoleService: RoleServiceMock };
});

describe('EmployeeService', () => {
  let employeeService: EmployeeService;
  let employeeRepository: any;
  let roleService: any;
  const userId = 'user-123';
  const companyId = 'company-123';

  beforeEach(() => {
    vi.clearAllMocks();
    employeeRepository = new EmployeeRepository();
    roleService = new RoleService({} as any);
    // Injeta os mocks no serviço para que ele use estas instâncias
    employeeService = new EmployeeService(employeeRepository as any, roleService as any);
  });

  describe('findAll', () => {
    it('deve listar todos os funcionários', async () => {
      const base = {
        cpf: '52998224725',
        rg: '1234567',
        birthDate: new Date('1990-01-01'),
        phone: '11999999999',
        address: 'Rua A, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01000-000',
        department: 'TI',
        salary: 5000,
        hireDate: new Date('2020-01-01'),
        terminationDate: null,
        status: 'active',
        bankAccount: null,
        emergencyContact: null,
        notes: null,
        userId: 'user-123',
        companyId: companyId,
        createdAt: new Date('2020-01-01T00:00:00.000Z'),
        updatedAt: new Date('2020-06-01T00:00:00.000Z'),
        deletedAt: null,
      };
      const mockEmployees = [
        { id: '1', name: 'Funcionário 1', email: 'func1@example.com', position: 'Dev', ...base },
        { id: '2', name: 'Funcionário 2', email: 'func2@example.com', position: 'QA', ...base }
      ];
      
      employeeRepository.findMany.mockResolvedValue({
        data: mockEmployees,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      
      const result = await employeeService.findMany({ page: 1, limit: 10 } as any, companyId, userId);
      
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
    });
  });

  describe('findById', () => {
    it('deve buscar um funcionário por ID', async () => {
      const mockEmployee = {
        id: '1',
        name: 'Funcionário 1',
        email: 'func1@example.com',
        cpf: '52998224725',
        rg: '1234567',
        birthDate: new Date('1990-01-01'),
        phone: '11999999999',
        address: 'Rua A, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01000-000',
        position: 'Desenvolvedor',
        department: 'TI',
        salary: 5000,
        hireDate: new Date('2020-01-01'),
        terminationDate: null,
        status: 'active',
        bankAccount: null,
        emergencyContact: null,
        notes: null,
        userId: 'user-123',
        companyId: companyId,
        createdAt: new Date('2020-01-01T00:00:00.000Z'),
        updatedAt: new Date('2020-06-01T00:00:00.000Z'),
        deletedAt: null,
      };
      
      employeeRepository.findById.mockResolvedValue(mockEmployee);
      
      const result = await employeeService.findById('1', companyId, userId);
      
      expect(employeeRepository.findById).toHaveBeenCalledWith('1', companyId);
    });
  });

  describe('create', () => {
    it('deve criar um novo funcionário', async () => {
      const employeeData = { 
        // CAMPOS OBRIGATÓRIOS DO DTO AGORA ESTÃO AQUI:
        userId: 'user-to-create-emp', // <<< NOVO
        companyId: companyId, // <<< NOVO (Ou use o companyId da chamada, dependendo da sua arquitetura)
        roleId: 'role-default-id', // <<< NOVO

        // CAMPOS OPCIONAIS DO DTO:
        department: 'TI',
        position: 'Analista',
        salary: 5000,

        // Formato de data corrigido para z.string().datetime()
        hireDate: '2020-01-01T10:00:00.000Z', 
        isActive: true
      };
      
      employeeRepository.cpfExists.mockResolvedValue(false);
      employeeRepository.emailExists.mockResolvedValue(false);

      const mockCreatedEmployee = {
        id: '3',
        ...employeeData,
        rg: '1234567',
        phone: '11999999999',
        address: 'Rua A, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01000-000',
        terminationDate: null,
        status: 'active',
        bankAccount: null,
        emergencyContact: null,
        notes: null,
        userId: 'user-123',
        companyId: companyId,
        birthDate: new Date('1990-01-01'),
        hireDate: new Date('2020-01-01'),
        createdAt: new Date('2020-01-01T00:00:00.000Z'),
        updatedAt: new Date('2020-06-01T00:00:00.000Z'),
        deletedAt: null,
      };

      employeeRepository.create.mockResolvedValue(mockCreatedEmployee);
      
      const result = await employeeService.create(employeeData, companyId, userId);
      
      expect(employeeRepository.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('deve atualizar um funcionário existente', async () => {
      const employeeId = '1';
      const updateData = { name: 'Funcionário Atualizado', position: 'Gerente' };
      
      const baseEmployee = {
        id: employeeId,
        name: 'Funcionário 1',
        email: 'func1@example.com',
        cpf: '12345678901',
        rg: '1234567',
        birthDate: new Date('1990-01-01'),
        phone: '11999999999',
        address: 'Rua A, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01000-000',
        position: 'Analista',
        department: 'TI',
        salary: 5000,
        hireDate: new Date('2020-01-01'),
        terminationDate: null,
        status: 'active',
        bankAccount: null,
        emergencyContact: null,
        notes: null,
        userId: 'user-123',
        companyId: companyId,
        createdAt: new Date('2020-01-01T00:00:00.000Z'),
        updatedAt: new Date('2020-06-01T00:00:00.000Z'),
        deletedAt: null,
      };

      employeeRepository.findById.mockResolvedValue(baseEmployee);
      employeeRepository.update.mockResolvedValue({ ...baseEmployee, ...updateData });
      
      const result = await employeeService.update(employeeId, updateData, companyId, userId);
      
      expect(employeeRepository.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve excluir um funcionário', async () => {
      const employeeId = '1';
      
      employeeRepository.findById.mockResolvedValue({ id: employeeId, name: 'Funcionário 1' });
      employeeRepository.delete.mockResolvedValue({ id: employeeId, name: 'Funcionário 1' });
      
      await employeeService.delete(employeeId, companyId, userId);
      
      expect(employeeRepository.delete).toHaveBeenCalledWith(employeeId, companyId);
    });
  });
});