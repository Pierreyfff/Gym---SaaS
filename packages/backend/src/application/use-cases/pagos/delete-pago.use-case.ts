import { Inject, Injectable } from '@nestjs/common';
import {
  IPagoRepository,
  PAGO_REPOSITORY,
} from '@domain/repositories/pago.repository.interface';

@Injectable()
export class DeletePagoUseCase {
  constructor(
    @Inject(PAGO_REPOSITORY)
    private readonly pagoRepository: IPagoRepository,
  ) {}
}