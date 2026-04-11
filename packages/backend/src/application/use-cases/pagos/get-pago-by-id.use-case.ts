import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IPagoRepository,
  PAGO_REPOSITORY,
} from '@domain/repositories/pago.repository.interface';

@Injectable()
export class GetPagoByIdUseCase {
  constructor(
    @Inject(PAGO_REPOSITORY)
    private readonly pagoRepository: IPagoRepository,
  ) {}

  async execute(id: string) {
    const pago = await this.pagoRepository.findById(id);

    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    return pago;
  }
}