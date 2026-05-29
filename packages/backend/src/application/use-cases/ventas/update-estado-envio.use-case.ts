import { Injectable, Inject } from '@nestjs/common';
import { IVentaProductoRepository } from '@domain/repositories/venta-producto.repository.interface';
import { UpdateEstadoEnvioDto, VentaProductoResponseDto } from '@gym-saas/shared';

@Injectable()
export class UpdateEstadoEnvioUseCase {
  constructor(
    @Inject('IVentaProductoRepository')
    private readonly ventaRepository: IVentaProductoRepository,
  ) {}

  async execute(
    id: string,
    gimnasioId: string,
    dto: UpdateEstadoEnvioDto,
  ): Promise<VentaProductoResponseDto> {
    return this.ventaRepository.updateEstadoEnvio(id, gimnasioId, dto);
  }
}
