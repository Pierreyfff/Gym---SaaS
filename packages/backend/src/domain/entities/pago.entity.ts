export class PagoEntity {
  constructor(
    public readonly id: string,
    public readonly gimnasioId: string,
    public readonly membresiaId:  string,
    public readonly tipo: 'membresia' | 'producto',
    public readonly monto: number,
    public readonly metodoPago: 'efectivo' | 'tarjeta' | 'transferencia',
    public readonly estado: 'completado' | 'pendiente' | 'reembolsado' | 'rechazado',
    public readonly referencia:  string | null,
    public readonly notas: string | null,
    public readonly motivoReembolso:  string | null,
    public readonly fechaReembolso: Date | null,
    public readonly fechaCreacion: Date,
    public readonly fechaPago: Date,
  ) {}

  esReembolsado(): boolean {
    return this.estado === 'reembolsado';
  }

  puedeReembolsarse(): boolean {
    return this.estado === 'completado';
  }
}