import bcrypt from 'bcryptjs';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { 
  LoginDTO, 
  AuthResponseDTO, 
  UserResponseDTO, 
  UserRole, 
  ContractType, 
  ProjectStatus, 
  AreaResponseDTO, 
  ProjectSummaryDTO 
} from '../types';
import { CustomError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Tipos auxiliares para mapear o retorno do Prisma
interface PrismaUserArea {
  area: {
    id: string;
    name: string;
    description: string | null;
  };
}

interface PrismaUserProject {
  project: {
    id: string;
    name: string;
    status: string;
  };
  roleInProject: string | null;
}

interface PrismaUser {
  id: string;
  name: string;
  email: string;
  password: string;
  age: number | null;
  contractType: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  areas: PrismaUserArea[];
  projects: PrismaUserProject[];
}

interface JWTPayload {
  userId: string;
  role: UserRole;
  email: string;
}

interface DecodedToken extends JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export class AuthService {
  async login(loginData: LoginDTO): Promise<AuthResponseDTO> {
    const { email, password } = loginData;

    // Buscar usuário por email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        areas: {
          include: { 
            area: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        },
        projects: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
          }
        }
      }
    }) as PrismaUser | null;

    if (!user) {
      logger.warn(`Tentativa de login com email inexistente: ${email}`);
      throw new CustomError('Credenciais inválidas', 401);
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.warn(`Tentativa de login com senha incorreta para: ${email}`);
      throw new CustomError('Credenciais inválidas', 401);
    }

    // Validar e converter role
    const userRole = this.validateUserRole(user.role);
    const contractType = this.validateContractType(user.contractType);

    // Gerar token JWT
    const token = this.generateToken({
      userId: user.id,
      role: userRole,
      email: user.email
    });

    logger.info(`Login realizado com sucesso: ${email}`);

    // Mapear áreas do formato Prisma para AreaResponseDTO
    const areas: AreaResponseDTO[] = user.areas.map((ua: PrismaUserArea) => ({
      id: ua.area.id,
      name: ua.area.name,
      description: ua.area.description || undefined
    }));

    // Mapear projetos do formato Prisma para ProjectSummaryDTO
    const projects: ProjectSummaryDTO[] = user.projects.map((up: PrismaUserProject) => ({
      id: up.project.id,
      name: up.project.name,
      status: this.validateProjectStatus(up.project.status),
      roleInProject: up.roleInProject || undefined
    }));

    // Preparar resposta no formato UserResponseDTO
    const userResponse: UserResponseDTO = {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age || 0, // Tratar null/undefined convertendo para 0 ou valor padrão
      contractType: contractType,
      role: userRole,
      areas: areas,
      projects: projects,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return {
      user: userResponse,
      token
    };
  }

  async validateToken(token: string): Promise<DecodedToken> {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new CustomError('Configuração JWT inválida', 500);
      }

      const decoded = jwt.verify(token, secret) as DecodedToken;
      
      // Validar se o payload tem a estrutura esperada
      if (!decoded.userId || !decoded.role || !decoded.email) {
        throw new CustomError('Token com payload inválido', 401);
      }

      return decoded;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Token inválido', 401);
    }
  }

  private generateToken(payload: JWTPayload): string {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      throw new CustomError('Configuração JWT não encontrada', 500);
    }

    // Força compatibilidade com o tipo do SignOptions
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as unknown as SignOptions['expiresIn'];

    const options: SignOptions = { expiresIn };

    return jwt.sign(payload, secret, options);
  }

  private validateUserRole(role: string): UserRole {
    const validRoles = Object.values(UserRole) as string[];
    
    if (!validRoles.includes(role)) {
      throw new CustomError(`Role inválido: ${role}`, 500);
    }

    return role as UserRole;
  }

  private validateContractType(contractType: string | null): ContractType | undefined {
    if (!contractType) {
      return undefined;
    }

    const validContractTypes = Object.values(ContractType) as string[];
    
    if (!validContractTypes.includes(contractType)) {
      throw new CustomError(`Tipo de contrato inválido: ${contractType}`, 500);
    }

    return contractType as ContractType;
  }

  private validateProjectStatus(status: string): ProjectStatus {
    const validStatuses = Object.values(ProjectStatus) as string[];
    
    if (!validStatuses.includes(status)) {
      // Se o status não for válido, usar um padrão ou lançar erro
      logger.warn(`Status de projeto inválido encontrado: ${status}, usando PLANNING como padrão`);
      return ProjectStatus.PLANNING;
    }

    return status as ProjectStatus;
  }

  // Método auxiliar para buscar usuário pelo ID (útil para middleware de auth)
  async getUserById(userId: string): Promise<UserResponseDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        contractType: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        areas: {
          include: { 
            area: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        },
        projects: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
          }
        }
      }
    }) as PrismaUser | null;

    if (!user) {
      throw new CustomError('Usuário não encontrado', 404);
    }

    const areas: AreaResponseDTO[] = user.areas.map((ua) => ({
      id: ua.area.id,
      name: ua.area.name,
      description: ua.area.description || undefined
    }));

    const projects: ProjectSummaryDTO[] = user.projects.map((up) => ({
      id: up.project.id,
      name: up.project.name,
      status: this.validateProjectStatus(up.project.status),
      roleInProject: up.roleInProject || undefined
    }));

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age || 0, // Tratar null/undefined convertendo para 0 ou valor padrão
      contractType: this.validateContractType(user.contractType),
      role: this.validateUserRole(user.role),
      areas: areas,
      projects: projects,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  // Método auxiliar para extrair dados do usuário do token (para middleware)
  async getUserFromToken(token: string): Promise<{ id: string; role: UserRole; email: string }> {
    const decoded = await this.validateToken(token);
    
    return {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email
    };
  }
}
