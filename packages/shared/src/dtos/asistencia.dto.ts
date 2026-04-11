import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateAsistenciaDto {
  @IsString()
  clienteId: string;

  @IsOptional()
  @IsDateString()
  marcaTiempo?:  string;
}

export class AsistenciaResponseDto {
  id: string;
  gimnasioId: string;
  marcaTiempo: Date;
  cliente: {
    id: string;
    nombre: string;
    apellido: string;
    email:  string;
  };
  fechaCreacion?:  Date;
}

export class AsistenciaListResponseDto {
  asistencias: AsistenciaResponseDto[];
  total: number;
}