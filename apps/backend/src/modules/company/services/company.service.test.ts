import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompanyService } from './company.service';
import { CompanyRepository } from '../repositories';
import { AppError } from '../../../shared/errors/AppError';

// Mock do repositório como classe para suportar 'new'
vi.mock('../repositories', () => ({
  CompanyRepository: class CompanyRepository {
    findAll = vi.fn();
    findMany = vi.fn();
    findById = vi.fn();
    create = vi.fn();
    update = vi.fn();
    delete = vi.fn();
    documentExists = vi.fn();
    emailExists = vi.fn();
  }
}));

describe('CompanyService', () => {
  let companyService: CompanyService;
  let companyRepository: any;

  beforeEach(() => {
    vi.clearAllMocks();
    companyRepository = new CompanyRepository();
    // Injeta o repositório mockado no serviço para capturar as chamadas corretamente
    companyService = new CompanyService(companyRepository as any);
  });

  describe('findAll', () => {
    it('deve listar todas as empresas', async () => {
      const mockCompanies = [
        { id: '1', name: 'Empresa 1', cnpj: '12345678000190' },
        { id: '2', name: 'Empresa 2', cnpj: '98765432000110' }
      ];
      
      companyRepository.findMany.mockResolvedValue({
        data: mockCompanies,
        total: 2,
      });
      
      const result = await companyService.findMany({ page: 1, limit: 10 } as any);
      
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
    });
  });

  describe('findById', () => {
    it('deve buscar uma empresa por ID', async () => {
      const mockCompany = { 
        id: '1', 
        name: 'Empresa 1', 
        cnpj: '12345678000190',
        email: 'empresa@example.com'
      };
      
      companyRepository.findById.mockResolvedValue(mockCompany);
      
      const result = await companyService.findById('1');
      
      expect(companyRepository.findById).toHaveBeenCalledWith('1');
    });
    
    it('deve lançar erro para empresa não encontrada', async () => {
      companyRepository.findById.mockResolvedValue(null);
      
      await expect(companyService.findById('999')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('deve criar uma nova empresa', async () => {
      const companyData = { 
        name: 'Nova Empresa', 
        cnpj: '19131243000197',
        email: 'nova@example.com',
        phone: '11999999999',
        address: {
          street: 'Rua Teste',
          number: '123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234567'
        }
      };
      
      companyRepository.documentExists.mockResolvedValue(false);
      companyRepository.emailExists.mockResolvedValue(false);

      const mockCreatedCompany = { 
        id: '3',
        name: companyData.name,
        cnpj: companyData.cnpj,
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address,
        city: companyData.address.city,
        state: companyData.address.state,
        zipCode: companyData.address.zipCode,
        description: 'Empresa criada para testes',
        website: 'https://empresa.example.com',
        logo: null,
        isActive: true,
        createdAt: new Date('2020-01-01T00:00:00.000Z'),
        updatedAt: new Date('2020-06-01T00:00:00.000Z'),
      };
      
      companyRepository.create.mockResolvedValue(mockCreatedCompany);
      
      const result = await companyService.create(companyData);
      
      expect(companyRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });
  });

  describe('update', () => {
    it('deve atualizar uma empresa existente', async () => {
      const companyId = '1';
      const updateData = { name: 'Empresa Atualizada' };
      
      companyRepository.findById.mockResolvedValue({ id: companyId, name: 'Empresa 1' });
      companyRepository.update.mockResolvedValue({ id: companyId, name: 'Empresa Atualizada' });
      
      const result = await companyService.update(companyId, updateData);
      
      expect(companyRepository.update).toHaveBeenCalled();
      expect(result.name).toBe('Empresa Atualizada');
    });
  });

  describe('delete', () => {
    it('deve excluir uma empresa', async () => {
      const companyId = '1';
      
      companyRepository.findById.mockResolvedValue({ id: companyId, name: 'Empresa 1' });
      companyRepository.delete.mockResolvedValue({ id: companyId, name: 'Empresa 1' });
      
      await companyService.delete(companyId);
      
      expect(companyRepository.delete).toHaveBeenCalledWith(companyId);
    });
  });
});