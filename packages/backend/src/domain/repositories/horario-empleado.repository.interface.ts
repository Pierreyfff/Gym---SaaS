import {
  CreateHorarioEmpleadoDto,
  UpdateHorarioEmpleadoDto,
  HorarioEmpleadoResponseDto,
  HorarioEmpleadoListResponseDto,
} from '@gym-saas/shared';

export interface IHorarioEmpleadoRepository {
  create(gimnasioId: string, dto: CreateHorarioEmpleadoDto): Promise<HorarioEmpleadoResponseDto>;
  findAll(gimnasioId: string, usuarioId?: string): Promise<HorarioEmpleadoListResponseDto>;
  findById(id: string, gimnasioId: string): Promise<HorarioEmpleadoResponseDto | null>;
  update(id: string, gimnasioId: string, dto: UpdateHorarioEmpleadoDto): Promise<HorarioEmpleadoResponseDto>;
  delete(id: string, gimnasioId: string): Promise<void>;
  findByUsuarioAndDia(gimnasioId: string, usuarioId: string, diaSemana: number): Promise<HorarioEmpleadoResponseDto | null>;
}
