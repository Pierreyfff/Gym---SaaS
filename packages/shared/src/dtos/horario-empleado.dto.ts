import { IsString, IsInt, IsBoolean, IsOptional, Min, Max, Matches } from 'class-validator';

export class CreateHorarioEmpleadoDto {
  @IsString()
  usuarioId: string;

  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana: number;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'horaInicio debe tener formato HH:mm' })
  horaInicio: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'horaFin debe tener formato HH:mm' })
  horaFin: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateHorarioEmpleadoDto {
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'horaInicio debe tener formato HH:mm' })
  horaInicio?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'horaFin debe tener formato HH:mm' })
  horaFin?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class HorarioEmpleadoResponseDto {
  id: string;
  gimnasioId: string;
  usuarioId: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  usuario?: {
    id: string;
    nombre: string;
    apellido: string;
    rol: string;
  };
}

export class HorarioEmpleadoListResponseDto {
  horarios: HorarioEmpleadoResponseDto[];
  total: number;
}

export const DIAS_SEMANA: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};
