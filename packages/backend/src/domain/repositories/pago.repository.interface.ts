import { PagoEntity } from '../entities/pago.entity';

export interface CreatePagoData {
  gimnasioId: string;
  membresiaId: string;
  clienteId: string;
  monto: number;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia';
  notas?: string;
}

export interface UpdatePagoData {
  notas?: string;
}

export interface ReembolsarPagoData {
  motivo: string;
  notas?: string;
}

export interface PagoConRelaciones {
  pago: PagoEntity;
  membresia: {
    id: string;
    fechaInicio: Date;
    fechaFin: Date;
    estado: string;
    cliente: {
      id: string;
      nombre:  string;
      apellido: string;
      email: string;
    };
    plan: {
      id: string;
      nombre: string;
      precio: number;
    };
  };
}

export interface IPagoRepository {
  findAllByGimnasio(gimnasioId: string): Promise<PagoConRelaciones[]>;
  findById(id: string, gimnasioId?: string): Promise<PagoConRelaciones | null>;
  create(data: CreatePagoData): Promise<PagoConRelaciones>;
  update(id: string, data: UpdatePagoData, gimnasioId?: string): Promise<PagoConRelaciones>;
  reembolsar(id: string, data: ReembolsarPagoData): Promise<PagoConRelaciones>;
}

export const PAGO_REPOSITORY = Symbol('IPagoRepository');