import { Inject, Injectable } from '@nestjs/common';
import {
  IPagoRepository,
  PAGO_REPOSITORY,
} from '@domain/repositories/pago.repository.interface';

@Injectable()
export class GetPagosUseCase {
  constructor(
    @Inject(PAGO_REPOSITORY)
    private readonly pagoRepository: IPagoRepository,
  ) {}

  async execute(gimnasioId: string) {
    return this.pagoRepository.findAllByGimnasio(gimnasioId);
  }
}