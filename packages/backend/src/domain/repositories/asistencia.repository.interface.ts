import { AsistenciaEntity } from '../entities/asistencia.entity';

export interface CreateAsistenciaData {
  gimnasioId: string;
  clienteId: string;
  marcaTiempo?: Date;
}

export interface AsistenciaConRelaciones {
  asistencia: AsistenciaEntity;
  cliente: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
}

export interface IAsistenciaRepository {
  findAllByGimnasio(gimnasioId: string): Promise<AsistenciaConRelaciones[]>;
  findById(id: string, gimnasioId?: string): Promise<AsistenciaConRelaciones | null>;
  findTodayByCliente(
    gimnasioId: string,
    clienteId: string,
  ): Promise<AsistenciaConRelaciones | null>;
  findByDateRange(
    gimnasioId: string,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<AsistenciaConRelaciones[]>;
  create(data: CreateAsistenciaData): Promise<AsistenciaConRelaciones>;
  delete(id: string, gimnasioId?: string): Promise<void>;
}

export const ASISTENCIA_REPOSITORY = Symbol('IAsistenciaRepository');