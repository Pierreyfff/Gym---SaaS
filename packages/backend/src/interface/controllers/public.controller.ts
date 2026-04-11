import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { Public } from '@infrastructure/decorators/public.decorator';
import { GetConfiguracionUseCase } from '@application/use-cases/configuracion/get-configuracion.use-case';
import { GetAllStaffUseCase } from '@application/use-cases/staff/get-all-staff.use-case';
import { GetAllTestimoniosUseCase } from '@application/use-cases/testimonios/get-all-testimonios.use-case';
import { GetAllImagenesGaleriaUseCase } from '@application/use-cases/galeria/get-all-imagenes.use-case';
import { GetAllPlanesUseCase } from '@application/use-cases/planes/get-all-planes.use-case';
import { GetAllProductosUseCase } from '@application/use-cases/productos/get-all-productos.use-case';

@Controller('public')
export class PublicController {
  constructor(
    private readonly getConfiguracionUseCase: GetConfiguracionUseCase,
    private readonly getAllStaffUseCase: GetAllStaffUseCase,
    private readonly getAllTestimoniosUseCase: GetAllTestimoniosUseCase,
    private readonly getAllImagenesGaleriaUseCase: GetAllImagenesGaleriaUseCase,
    private readonly getAllPlanesUseCase: GetAllPlanesUseCase,
    private readonly getAllProductosUseCase: GetAllProductosUseCase,
  ) {}

  /**
   * Obtener gimnasioId del query param o usar el default del .env
   */
  private getGimnasioId(gimnasioId?: string): string {
    if (gimnasioId) {
      return gimnasioId;
    }

    const defaultId = process.env.DEFAULT_GIMNASIO_ID;
    if (!defaultId) {
      throw new BadRequestException(
        'gimnasioId es requerido. Configura DEFAULT_GIMNASIO_ID en .env',
      );
    }

    return defaultId;
  }

  @Public()
  @Get('configuracion')
  async getConfiguracion(@Query('gimnasioId') gimnasioId?: string) {
    return this.getConfiguracionUseCase.execute(this.getGimnasioId(gimnasioId));
  }

  @Public()
  @Get('staff')
  async getStaff(@Query('gimnasioId') gimnasioId?: string) {
    const result = await this.getAllStaffUseCase.execute(
      this.getGimnasioId(gimnasioId),
    );
    return {
      staff: result.staff.filter((s) => s.activo),
      total: result.staff.filter((s) => s.activo).length,
    };
  }

  @Public()
  @Get('testimonios')
  async getTestimonios(@Query('gimnasioId') gimnasioId?: string) {
    const result = await this.getAllTestimoniosUseCase.execute(
      this.getGimnasioId(gimnasioId),
    );
    return {
      testimonios: result.testimonios.filter((t) => t.activo),
      total: result.testimonios.filter((t) => t.activo).length,
    };
  }

  @Public()
  @Get('galeria')
  async getGaleria(@Query('gimnasioId') gimnasioId?: string) {
    const result = await this.getAllImagenesGaleriaUseCase.execute(
      this.getGimnasioId(gimnasioId),
    );
    return {
      imagenes: result.imagenes.filter((img) => img.activo),
      total: result.imagenes.filter((img) => img.activo).length,
    };
  }

  @Public()
  @Get('planes')
  async getPlanes(@Query('gimnasioId') gimnasioId?: string) {
    return this.getAllPlanesUseCase.execute(this.getGimnasioId(gimnasioId));
  }

  @Public()
  @Get('productos')
  async getProductos(@Query('gimnasioId') gimnasioId?: string) {
    const result = await this.getAllProductosUseCase.execute(
      this.getGimnasioId(gimnasioId),
    );
    return {
      productos: result.productos.filter((p) => p.estado === 'activo' && p.stock > 0),
      total: result.productos.filter((p) => p.estado === 'activo' && p.stock > 0).length,
    };
  }
}