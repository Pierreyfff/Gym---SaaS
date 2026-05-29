import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';
import { IConfiguracionGimnasioRepository } from '@domain/repositories/configuracion-gimnasio.repository.interface';
import { UpdateConfiguracionGimnasioDto, ConfiguracionGimnasioResponseDto } from '@gym-saas/shared';

@Injectable()
export class ConfiguracionGimnasioRepository implements IConfiguracionGimnasioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByGimnasioId(gimnasioId: string): Promise<ConfiguracionGimnasioResponseDto | null> {
    const config = await this.prisma.configuracionGimnasio.findUnique({
      where: { gimnasioId },
    });

    if (!config) return null;

    return this.mapToDto(config);
  }

  async createOrUpdate(
    gimnasioId: string,
    data: UpdateConfiguracionGimnasioDto,
  ): Promise<ConfiguracionGimnasioResponseDto> {
    const config = await this.prisma.configuracionGimnasio.upsert({
      where: { gimnasioId },
      update: data,
      create: {
        gimnasioId,
        ...data,
      },
    });

    return this.mapToDto(config);
  }

  private mapToDto(config: any): ConfiguracionGimnasioResponseDto {
    return {
      id: config.id,
      gimnasioId: config.gimnasioId,
      nombreNegocio: config.nombreNegocio || undefined,
      logoUrl: config.logoUrl || undefined,
      colorPrimario: config.colorPrimario,
      colorSecundario: config.colorSecundario,
      horarioApertura: config.horarioApertura || undefined,
      horarioCierre: config.horarioCierre || undefined,
      diasLaborales: config.diasLaborales,
      telefono: config.telefono || undefined,
      email: config.email || undefined,
      direccion: config.direccion || undefined,
      sitioweb: config.sitioweb || undefined,
      facebook: config.facebook || undefined,
      instagram: config.instagram || undefined,
      twitter: config.twitter || undefined,
      whatsapp: config.whatsapp || undefined,
      youtube: config.youtube || undefined,
      tiktok: config.tiktok || undefined,
      imagenHero: config.imagenHero || undefined,
      imagenesCarrusel: config.imagenesCarrusel || [],
      descripcionCorta: config.descripcionCorta || undefined,
      descripcionLarga: config.descripcionLarga || undefined,
      misionVision: config.misionVision || undefined,
      mapaLatitud: config.mapaLatitud || undefined,
      mapaLongitud: config.mapaLongitud || undefined,
      politicaCancelacion: config.politicaCancelacion || undefined,
      terminosCondiciones: config.terminosCondiciones || undefined,
      notificarVencimiento7Dias: config.notificarVencimiento7Dias,
      notificarVencimiento3Dias: config.notificarVencimiento3Dias,
      notificarVencimiento1Dia: config.notificarVencimiento1Dia,
      notificarBienvenida: config.notificarBienvenida,
      notificarRenovacion: config.notificarRenovacion,
      costoEnvio: Number(config.costoEnvio) || 0,
      fechaCreacion: config.fechaCreacion,
      fechaActualizacion: config.fechaActualizacion,
    };
  }
}