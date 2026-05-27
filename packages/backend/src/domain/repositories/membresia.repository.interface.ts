import { MembresiaEntity } from '../entities/membresia.entity';

export interface IMembresiaRepository {
  findAllByGimnasio(gimnasioId: string): Promise<MembresiaConRelaciones[]>;
  
  findByClienteId(clienteId: string, gimnasioId?: string): Promise<MembresiaConRelaciones[]>;
  
  findById(id: string): Promise<MembresiaConRelaciones | null>;
  
  findActivaByCliente(clienteId: string): Promise<MembresiaConRelaciones | null>;
  
  create(data: CreateMembresiaData): Promise<MembresiaConRelaciones>;
  
  update(id: string, data: UpdateMembresiaData): Promise<MembresiaConRelaciones>;
  
  cancelar(id: string): Promise<MembresiaConRelaciones>;
  
  delete(id:  string): Promise<void>;
}

export interface MembresiaConRelaciones {
  membresia: MembresiaEntity;
  cliente: {
    id: string;
    nombre: string;
    apellido: string;
    email:  string;
  };
  plan: {
    id: string;
    nombre: string;
    precio: number;
    duracionDias: number;
  };
}

export interface CreateMembresiaData {
  gimnasioId:  string;
  clienteId:  string;
  planId: string;
  fechaInicio:  Date;
  fechaFin: Date;
}

export interface UpdateMembresiaData {
  fechaInicio?: Date;
  fechaFin?: Date;
  estado?:  'activa' | 'expirada' | 'cancelada';
}