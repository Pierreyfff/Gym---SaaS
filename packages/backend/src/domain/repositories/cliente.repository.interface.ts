import { UserEntity } from '../entities/user.entity';
import { PerfilClienteEntity } from '../entities/perfil-cliente.entity';

export interface IClienteRepository {
  findAllByGimnasio(gimnasioId: string): Promise<ClienteConPerfil[]>;
  
  findById(id: string): Promise<ClienteConPerfil | null>;
  
  findByEmailAndGimnasio(
    email: string,
    gimnasioId: string,
  ): Promise<ClienteConPerfil | null>;
  
  findByNombreApellidoTelefono(
    nombre: string,
    apellido: string,
    telefono: string,
    gimnasioId: string,
  ): Promise<ClienteConPerfil | null>;
  
  create(data: CreateClienteData): Promise<ClienteConPerfil>;
  
  update(id: string, userData: UpdateClienteData, perfilData: UpdatePerfilClienteData): Promise<ClienteConPerfil>;
  
  delete(id: string): Promise<void>;
}

export interface ClienteConPerfil {
  usuario: UserEntity;
  perfil: PerfilClienteEntity;
}

export interface CreateClienteData {
  gimnasioId: string;
  email: string;
  contrasenaHash: string;
  nombre: string;
  apellido: string;
  telefono?:  string;
  fechaNacimiento?: Date;
  genero?:  string;
  notas?: string;
}

export interface UpdateClienteData {
  email?: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
}

export interface UpdatePerfilClienteData {
  fechaNacimiento?: Date;
  genero?:  string;
  notas?: string;
}