export class AsistenciaEntity {
  constructor(
    public readonly id: string,
    public readonly gimnasioId: string,
    public readonly clienteId: string,
    public readonly marcaTiempo: Date,
    public readonly fechaCreacion?:  Date,
  ) {}
}