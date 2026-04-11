import { UserEntity } from '../entities/user.entity';

// Contrato que debe cumplir cualquier implementación del repositorio
export interface IUserRepository {
  findByEmailAndGimnasio(
    email: string,
    gimnasioId: string,
  ): Promise<UserEntity | null>;
  
  findById(id:  string): Promise<UserEntity | null>;
  
  findAllByGimnasio(gimnasioId: string): Promise<UserEntity[]>;
  
  create(data: CreateUserData): Promise<UserEntity>;
  
  update(id: string, data: UpdateUserData): Promise<UserEntity>;
  
  updatePassword(id: string, newPasswordHash: string): Promise<void>;
  
  delete(id:  string): Promise<void>;
  
  changeStatus(id: string, estado: 'activo' | 'inactivo'): Promise<UserEntity>;
}

export interface CreateUserData {
  gimnasioId: string;
  email: string;
  contrasenaHash: string;
  nombre: string;
  apellido: string;
  telefono?:  string;
  rol: 'admin' | 'recepcionista' | 'entrenador' | 'cliente';
}

export interface UpdateUserData {
  email?: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  rol?: 'admin' | 'recepcionista' | 'entrenador' | 'cliente';
}