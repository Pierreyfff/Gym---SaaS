export class PerfilClienteEntity {
  constructor(
    public readonly id: string,
    public readonly usuarioId: string,
    public readonly fechaNacimiento:  Date | null,
    public readonly genero: string | null,
    public readonly notas: string | null,
    public readonly fechaCreacion: Date,
    public readonly fechaActualizacion: Date,
  ) {}

  calcularEdad(): number | null {
    if (!this.fechaNacimiento) return null;
    
    const hoy = new Date();
    let edad = hoy.getFullYear() - this.fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - this.fechaNacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < this.fechaNacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }
}