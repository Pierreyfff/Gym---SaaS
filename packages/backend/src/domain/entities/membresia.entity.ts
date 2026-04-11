export class MembresiaEntity {
  constructor(
    public readonly id: string,
    public readonly gimnasioId: string,
    public readonly clienteId: string,
    public readonly planId: string,
    public readonly fechaInicio: Date,
    public readonly fechaFin: Date,
    public readonly estado: 'activa' | 'expirada' | 'cancelada',
    public readonly fechaCreacion: Date,
    public readonly fechaActualizacion: Date,
  ) {}

  estaActiva(): boolean {
    return this.estado === 'activa' && this.fechaFin >= new Date();
  }

  estaVencida(): boolean {
    return this.fechaFin < new Date();
  }

  diasRestantes(): number {
    const hoy = new Date();
    const diff = this.fechaFin.getTime() - hoy.getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 0;
  }

  diasTranscurridos(): number {
    const hoy = new Date();
    const diff = hoy.getTime() - this.fechaInicio.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}