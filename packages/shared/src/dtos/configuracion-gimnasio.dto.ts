import { IsString, IsOptional, IsBoolean, IsArray, IsHexColor, IsUrl, IsNumber } from 'class-validator';

export class UpdateConfiguracionGimnasioDto {
  @IsOptional()
  @IsString()
  nombreNegocio?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsHexColor()
  colorPrimario?: string;

  @IsOptional()
  @IsHexColor()
  colorSecundario?: string;

  @IsOptional()
  @IsString()
  horarioApertura?: string;

  @IsOptional()
  @IsString()
  horarioCierre?: string;

  @IsOptional()
  @IsArray()
  diasLaborales?: string[];

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsUrl()
  sitioweb?: string;

  @IsOptional()
  @IsString()
  facebook?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  twitter?: string;

  // 🆕 NUEVAS REDES SOCIALES
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsUrl()
  youtube?: string;

  @IsOptional()
  @IsString()
  tiktok?: string;

  // 🆕 IMÁGENES
  @IsOptional()
  @IsUrl()
  imagenHero?: string;

  @IsOptional()
  @IsArray()
  imagenesCarrusel?: string[];

  // 🆕 TEXTOS
  @IsOptional()
  @IsString()
  descripcionCorta?: string;

  @IsOptional()
  @IsString()
  descripcionLarga?: string;

  @IsOptional()
  @IsString()
  misionVision?: string;

  // 🆕 UBICACIÓN
  @IsOptional()
  @IsString()
  mapaLatitud?: string;

  @IsOptional()
  @IsString()
  mapaLongitud?: string;

  @IsOptional()
  @IsString()
  politicaCancelacion?: string;

  @IsOptional()
  @IsString()
  terminosCondiciones?: string;

  @IsOptional()
  @IsBoolean()
  notificarVencimiento7Dias?: boolean;

  @IsOptional()
  @IsBoolean()
  notificarVencimiento3Dias?: boolean;

  @IsOptional()
  @IsBoolean()
  notificarVencimiento1Dia?: boolean;

  @IsOptional()
  @IsBoolean()
  notificarBienvenida?: boolean;

  @IsOptional()
  @IsBoolean()
  notificarRenovacion?: boolean;
}

export class ConfiguracionGimnasioResponseDto {
  id: string;
  gimnasioId: string;
  nombreNegocio?: string;
  logoUrl?: string;
  colorPrimario: string;
  colorSecundario: string;
  horarioApertura?: string;
  horarioCierre?: string;
  diasLaborales: string[];
  telefono?: string;
  email?: string;
  direccion?: string;
  sitioweb?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  whatsapp?: string;
  youtube?: string;
  tiktok?: string;
  imagenHero?: string;
  imagenesCarrusel: string[];
  descripcionCorta?: string;
  descripcionLarga?: string;
  misionVision?: string;
  mapaLatitud?: string;
  mapaLongitud?: string;
  politicaCancelacion?: string;
  terminosCondiciones?: string;
  notificarVencimiento7Dias: boolean;
  notificarVencimiento3Dias: boolean;
  notificarVencimiento1Dia: boolean;
  notificarBienvenida: boolean;
  notificarRenovacion: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}