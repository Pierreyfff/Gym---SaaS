import { PlanEntity } from '../entities/plan.entity';

export interface IPlanRepository {
  findAllByGimnasio(gimnasioId: string): Promise<PlanEntity[]>;
  
  findById(id:   string): Promise<PlanEntity | null>;
  
  create(data: CreatePlanData): Promise<PlanEntity>;
  
  update(id: string, data: UpdatePlanData): Promise<PlanEntity>;
  
  delete(id:   string): Promise<void>;
}

export interface CreatePlanData {
  gimnasioId: string;
  nombre: string;
  descripcion?: string;
  duracionDias: number;
  precio:  number;
}

export interface UpdatePlanData {
  nombre?:  string;
  descripcion?: string;
  duracionDias?:  number;
  precio?: number;
}