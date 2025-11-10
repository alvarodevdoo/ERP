import {
  EmployeeRepository
} from '../repositories';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeFiltersDto,
  EmployeeResponseDto,
  EmployeeListResponseDto,
  EmployeeStatsDto
} from '../dtos';
import { AppError } from '../../../shared/errors/AppError';
import { validateCPF } from '../../../shared/utils/validators';
import { RoleService } from '../../role/services';
import { RoleRepository } from '../../role/repositories/role.repository';

/**
 * Service para gerenciamento de funcionários
 * Implementa regras de negócio e validações específicas
 */
export class EmployeeService {
  private employeeRepository: EmployeeRepository;
  private roleService: RoleService;

  constructor(
    employeeRepository?: EmployeeRepository,
    roleService?: RoleService
  ) {
    this.employeeRepository = employeeRepository || new EmployeeRepository();
    this.roleService = roleService || new RoleService(new RoleRepository(this.employeeRepository.prisma));
  }

  /**
   * Cria um novo funcionário
   * @param data Dados do funcionário
   * @param companyId ID da empresa
   * @param userId ID do usuário que está criando
   * @returns Funcionário criado
   */
  async create(
    data: CreateEmployeeDto,
    companyId: string,
    userId: string
  ): Promise<EmployeeResponseDto> {
    // Validar permissão
    await this.validatePermission(userId, 'employee', 'create');

    // Validar data de admissão (não pode ser futura) se fornecida
    if (data.hireDate) {
      const hireDate = new Date(data.hireDate);
      if (hireDate > new Date()) {
        throw new AppError('Data de admissão não pode ser futura', 400);
      }
    }

    // Validar salário se fornecido
    if (data.salary !== undefined && data.salary <= 0) {
      throw new AppError('Salário deve ser maior que zero', 400);
    }

    try {
      const employee = await this.employeeRepository.create({
        ...data,
        companyId
      });

      return this.formatEmployeeResponse(employee);
    } catch {
      throw new AppError('Erro ao criar funcionário', 500);
    }
  }

  /**
   * Busca funcionário por ID
   * @param id ID do funcionário
   * @param companyId ID da empresa
   * @param userId ID do usuário que está buscando
   * @returns Funcionário encontrado
   */
  async findById(
    id: string,
    companyId: string,
    userId: string
  ): Promise<EmployeeResponseDto> {
    // Validar permissão
    await this.validatePermission(userId, 'employee', 'read');

    const employee = await this.employeeRepository.findById(id, companyId);
    if (!employee) {
      throw new AppError('Funcionário não encontrado', 404);
    }

    return this.formatEmployeeResponse(employee);
  }

  /**
   * Lista funcionários com filtros e paginação
   * @param filters Filtros de busca
   * @param companyId ID da empresa
   * @param userId ID do usuário que está buscando
   * @returns Lista paginada de funcionários
   */
  async findMany(
    filters: EmployeeFiltersDto,
    companyId: string,
    userId: string
  ): Promise<EmployeeListResponseDto> {
    // Validar permissão
    await this.validatePermission(userId, 'employee', 'read');

    // Incluir companyId nos filtros, conforme assinatura do repositório
    const result = await this.employeeRepository.findMany({ ...filters, companyId });

    return {
      data: result.data.map(employee => this.formatEmployeeResponse(employee)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    };
  }

  /**
   * Atualiza funcionário
   * @param id ID do funcionário
   * @param data Dados para atualização
   * @param companyId ID da empresa
   * @param userId ID do usuário que está atualizando
   * @returns Funcionário atualizado
   */
  async update(
    id: string,
    data: UpdateEmployeeDto,
    companyId: string,
    userId: string
  ): Promise<EmployeeResponseDto> {
    // Validar permissão
    await this.validatePermission(userId, 'employee', 'update');

    // Verificar se funcionário existe
    const existingEmployee = await this.employeeRepository.findById(id, companyId);
    if (!existingEmployee) {
      throw new AppError('Funcionário não encontrado', 404);
    }

    // Validar salário se fornecido
    if (data.salary !== undefined && data.salary <= 0) {
      throw new AppError('Salário deve ser maior que zero', 400);
    }

    // Validar data de admissão (não pode ser futura) se fornecida
    if (data.hireDate) {
      const hireDate = new Date(data.hireDate);
      if (hireDate > new Date()) {
        throw new AppError('Data de admissão não pode ser futura', 400);
      }
    }

    try {
      const employee = await this.employeeRepository.update(id, data, companyId);
      return this.formatEmployeeResponse(employee);
    } catch {
      throw new AppError('Erro ao atualizar funcionário', 500);
    }
  }

  /**
   * Deleta funcionário (soft delete)
   * @param id ID do funcionário
   * @param companyId ID da empresa
   * @param userId ID do usuário que está deletando
   */
  async delete(id: string, companyId: string, userId: string): Promise<void> {
    // Validar permissão
    await this.validatePermission(userId, 'employee', 'delete');

    // Verificar se funcionário existe
    const employee = await this.employeeRepository.findById(id, companyId);
    if (!employee) {
      throw new AppError('Funcionário não encontrado', 404);
    }

    // Verificar se funcionário pode ser deletado
    const canDelete = await this.canDeleteEmployee();
    if (!canDelete.canDelete) {
      throw new AppError(canDelete.reason!, 400);
    }

    try {
      await this.employeeRepository.delete(id, companyId);
    } catch {
      throw new AppError('Erro ao deletar funcionário', 500);
    }
  }

  /**
   * Restaura funcionário deletado
   * @param id ID do funcionário
   * @param companyId ID da empresa
   * @param userId ID do usuário que está restaurando
   * @returns Funcionário restaurado
   */
  async restore(
    id: string,
    companyId: string,
    userId: string
  ): Promise<EmployeeResponseDto> {
    // Validar permissão
    await this.validatePermission(userId, 'employee', 'update');

    try {
      const employee = await this.employeeRepository.restore(id, companyId);
      if (!employee) {
        throw new AppError('Funcionário não encontrado', 404);
      }

      return this.formatEmployeeResponse(employee);
    } catch {
      throw new AppError('Erro ao restaurar funcionário', 500);
    }
  }

  /**
   * Busca funcionários por departamento
   * @param department Departamento
   * @param companyId ID da empresa
   * @param userId ID do usuário
   * @returns Lista de funcionários
   */
  async findByDepartment(
    department: string,
    companyId: string,
    userId: string
  ): Promise<EmployeeResponseDto[]> {
    // Validar permissão
    await this.validatePermission(userId, 'employee', 'read');

    const employees = await this.employeeRepository.findByDepartment(
      department,
      companyId
    );

    return employees.map(employee => this.formatEmployeeResponse(employee));
  }

  /**
   * Busca funcionários por cargo
   * @param position Cargo
   * @param companyId ID da empresa
   * @param userId ID do usuário
   * @returns Lista de funcionários
   */
  async findByPosition(
    position: string,
    companyId: string,
    userId: string
  ): Promise<EmployeeResponseDto[]> {
    // Validar permissão
    await this.validatePermission(userId, 'employee', 'read');

    const employees = await this.employeeRepository.findByPosition(
      position,
      companyId
    );

    return employees.map(employee => this.formatEmployeeResponse(employee));
  }

  /**
   * Busca aniversariantes do mês
   * @param month Mês (1-12)
   * @param companyId ID da empresa
   * @param userId ID do usuário
   * @returns Lista de aniversariantes
   */
  async findBirthdaysInMonth(
    month: number,
    companyId: string,
    userId: string
  ): Promise<EmployeeResponseDto[]> {
    // Validar permissão
    await this.validatePermission(userId, 'employee', 'read');

    if (month < 1 || month > 12) {
      throw new AppError('Mês deve estar entre 1 e 12', 400);
    }

    const employees = await this.employeeRepository.findBirthdaysInMonth(
      month,
      companyId
    );

    return employees.map(employee => this.formatEmployeeResponse(employee));
  }

  /**
   * Busca contratações recentes
   * @param days Número de dias
   * @param companyId ID da empresa
   * @param userId ID do usuário
   * @returns Lista de contratações recentes
   */
  async findRecentHires(
    days: number,
    companyId: string,
    userId: string
  ): Promise<EmployeeResponseDto[]> {
    // Validar permissão
    await this.validatePermission(userId, 'employee', 'read');

    if (days <= 0) {
      throw new AppError('Número de dias deve ser maior que zero', 400);
    }

    const employees = await this.employeeRepository.findRecentHires(
      days,
      companyId
    );

    return employees.map(employee => this.formatEmployeeResponse(employee));
  }

  /**
   * Obtém estatísticas dos funcionários
   * @param companyId ID da empresa
   * @param userId ID do usuário
   * @returns Estatísticas
   */
  async getStats(
    companyId: string,
    userId: string
  ): Promise<EmployeeStatsDto> {
    // Validar permissão
    await this.validatePermission(userId, 'employee', 'read');

    const stats = await this.employeeRepository.getStats(companyId);
    return stats;
  }

  /**
   * Verifica se existe funcionário com o email informado na empresa
   */
  async emailExists(email: string, companyId: string, _userId?: string): Promise<boolean> {
    return this.employeeRepository.emailExists(email, companyId);
  }

  /**
   * Verifica se existe funcionário com o CPF informado na empresa
   */
  async cpfExists(cpf: string, companyId: string, _userId?: string): Promise<boolean> {
    return this.employeeRepository.cpfExists(cpf, companyId);
  }

  /**
   * Busca funcionários para relatório
   * @param companyId ID da empresa
   * @param userId ID do usuário
   * @param filters Filtros opcionais
   * @returns Lista de funcionários para relatório
   */
  async findForReport(
    companyId: string,
    userId: string,
    filters?: {
      department?: string;
      position?: string;
      status?: string;
      hiredAfter?: string;
      hiredBefore?: string;
    }
  ) {
    // Validar permissão
    await this.validatePermission(userId, 'employee', 'read');

    return this.employeeRepository.findForReport(companyId, filters);
  }

  /**
   * Calcula tempo de empresa
   * @param hireDate Data de admissão
   * @returns Tempo de empresa em anos, meses e dias
   */
  calculateCompanyTime(hireDate: string) {
    const hire = new Date(hireDate);
    const now = new Date();
    
    let years = now.getFullYear() - hire.getFullYear();
    let months = now.getMonth() - hire.getMonth();
    let days = now.getDate() - hire.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  }

  /**
   * Calcula idade do funcionário
   * @param birthDate Data de nascimento
   * @returns Idade em anos
   */
  calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const now = new Date();
    
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Verifica se funcionário pode ser deletado
   * @returns Resultado da verificação
   */
  private async canDeleteEmployee(): Promise<{ canDelete: boolean; reason?: string }> {
    // Por enquanto, permite deletar funcionários
    // TODO: Implementar verificações quando os módulos de ponto e folha forem criados
    return { canDelete: true };
  }

  /**
   * Valida permissão do usuário
   * @param userId ID do usuário
   * @param resource Recurso
   * @param action Ação
   */
  private async validatePermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<void> {
    const hasPermission = await this.roleService.checkPermission({
      userId,
      resource,
      permission: action,
    });

    if (!hasPermission) {
      throw new AppError('Acesso negado', 403);
    }
  }

  /**
   * Formata resposta do funcionário
   * @param employee Dados do funcionário
   * @returns Funcionário formatado
   */
  private formatEmployeeResponse(employee: any): EmployeeResponseDto {
    const hireDateIso = employee.hireDate instanceof Date
      ? employee.hireDate.toISOString()
      : employee.hireDate;
    const createdAtIso = employee.createdAt instanceof Date
      ? employee.createdAt.toISOString()
      : employee.createdAt;
    const updatedAtIso = employee.updatedAt instanceof Date
      ? employee.updatedAt.toISOString()
      : employee.updatedAt;

    return {
      id: employee.id,
      userId: employee.userId,
      companyId: employee.companyId,
      roleId: employee.roleId,
      employeeNumber: employee.employeeNumber,
      department: employee.department ?? null,
      position: employee.position ?? null,
      salary: employee.salary != null ? Number(employee.salary) : null,
      hireDate: hireDateIso,
      isActive: employee.isActive ?? true,
      createdAt: createdAtIso,
      updatedAt: updatedAtIso,
      user: employee.user
        ? { id: employee.user.id, name: employee.user.name, email: employee.user.email }
        : undefined,
      company: employee.company
        ? { id: employee.company.id, name: employee.company.name, tradeName: employee.company.tradeName ?? null }
        : undefined,
      role: employee.role
        ? { id: employee.role.id, name: employee.role.name }
        : undefined
    };
  }
}