import { AxiosInstance } from 'axios';

export interface PublicConfiguracion {
  nombreNegocio?: string;
  logoUrl?: string;
  colorPrimario: string;
  colorSecundario: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  sitioweb?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  whatsapp?: string;
  youtube?: string;
  tiktok?: string;
  imagenHero?: string;
  imagenesCarrusel: string[];
  descripcionCorta?: string;
  descripcionLarga?: string;
  misionVision?: string;
  mapaLatitud?: string;
  mapaLongitud?: string;
  horarioApertura?: string;
  horarioCierre?: string;
  diasLaborales: string[];
  costoEnvio: number;
}

export interface PublicStaff {
  id: string;
  nombre: string;
  apellido: string;
  cargo: string;
  descripcion?: string;
  imagenUrl?: string;
  orden: number;
  instagram?: string;
  facebook?: string;
}

export interface PublicTestimonio {
  id: string;
  nombreCliente: string;
  contenido: string;
  calificacion: number;
  imagenUrl?: string;
  orden: number;
}

export interface PublicImagen {
  id: string;
  titulo?: string;
  descripcion?: string;
  url: string;
  orden: number;
}

export interface PublicPlan {
  id: string;
  nombre: string;
  descripcion?: string;
  duracionDias: number;
  precio: number;
}

export interface PublicProducto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagenUrl?: string;
  categoria?: {
    id: string;
    nombre: string;
  };
}

export class PublicClient {
  constructor(private readonly axios: AxiosInstance) {}

  async getConfiguracion(gimnasioId?: string): Promise<PublicConfiguracion> {
    const params = gimnasioId ? { gimnasioId } : {};
    const response = await this.axios.get<PublicConfiguracion>('/public/configuracion', { params });
    return response.data;
  }

  async getStaff(gimnasioId?: string): Promise<{ staff: PublicStaff[]; total: number }> {
    const params = gimnasioId ? { gimnasioId } : {};
    const response = await this.axios.get<{ staff: PublicStaff[]; total: number }>(
      '/public/staff',
      { params },
    );
    return response.data;
  }

  async getTestimonios(gimnasioId?: string): Promise<{ testimonios: PublicTestimonio[]; total: number }> {
    const params = gimnasioId ? { gimnasioId } : {};
    const response = await this.axios.get<{ testimonios: PublicTestimonio[]; total: number }>(
      '/public/testimonios',
      { params },
    );
    return response.data;
  }

  async getGaleria(gimnasioId?: string): Promise<{ imagenes: PublicImagen[]; total: number }> {
    const params = gimnasioId ? { gimnasioId } : {};
    const response = await this.axios.get<{ imagenes: PublicImagen[]; total: number }>(
      '/public/galeria',
      { params },
    );
    return response.data;
  }

  async getPlanes(gimnasioId?: string): Promise<{ planes: PublicPlan[]; total: number }> {
    const params = gimnasioId ? { gimnasioId } : {};
    const response = await this.axios.get<{ planes: PublicPlan[]; total: number }>(
      '/public/planes',
      { params },
    );
    return response.data;
  }

    async getProductos(gimnasioId?: string): Promise<{ productos: PublicProducto[]; total: number }> {
    const params = gimnasioId ? { gimnasioId } : {};
    const response = await this.axios.get<{ productos: PublicProducto[]; total: number }>(
      '/public/productos',
      { params },
    );
    return response.data;
  }
}