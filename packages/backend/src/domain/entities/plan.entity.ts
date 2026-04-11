export class PlanEntity {
  constructor(
    public readonly id: string,
    public readonly gimnasioId: string,
    public readonly nombre: string,
    public readonly descripcion: string | null,
    public readonly duracionDias: number,
    public readonly precio: number,
    public readonly fechaCreacion: Date,
    public readonly fechaActualizacion:   Date,
  ) {}

  esMensual(): boolean {
    return this.duracionDias === 30;
  }

  esTrimestral(): boolean {
    return this.duracionDias === 90;
  }

  esAnual(): boolean {
    return this.duracionDias === 365;
  }

  getPrecioDiario(): number {
    return this.precio / this.duracionDias;
  }
}