// Entidad de dominio pura (sin dependencias de frameworks)

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly gimnasioId: string,
    public readonly email: string,
    public readonly contrasenaHash: string,
    public readonly nombre: string,
    public readonly apellido: string,
    public readonly telefono:  string | null,
    public readonly rol:  'admin' | 'recepcionista' | 'entrenador' | 'cliente',
    public readonly estado: 'activo' | 'inactivo',
    public readonly fechaCreacion: Date,
    public readonly fechaActualizacion:  Date,
  ) {}

  get nombreCompleto(): string {
    return `${this.nombre} ${this.apellido}`;
  }

  estaActivo(): boolean {
    return this.estado === 'activo';
  }

  esAdmin(): boolean {
    return this.rol === 'admin';
  }
}