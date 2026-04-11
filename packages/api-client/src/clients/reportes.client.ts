import { AxiosInstance } from 'axios';

export interface FiltrosIngresos {
  fechaInicio?: string;
  fechaFin?: string;
  tipo?: 'membresia' | 'producto' | 'todos';
  metodoPago?: string;
}

export interface IngresoDetallado {
  id: string;
  tipo: 'membresia' | 'producto';
  descripcion: string;
  cliente: {
    id: string;
    nombre: string;
    apellido: string;
  };
  monto: number;
  metodoPago: string;
  fecha: string;
}

export interface ResumenIngresos {
  totalIngresos: number;
  totalMembresias: number;
  totalProductos: number;
  cantidadTransacciones: number;
  promedioTransaccion: number;
  ingresosPorMetodo: Record<string, number>;
}

export interface IngresosDetalladosResponse {
  ingresos: IngresoDetallado[];
  resumen: ResumenIngresos;
}

export interface ProductoMasVendido {
  productoId: string;
  nombre: string;
  cantidadVendida: number;
  ingresosTotales: number;
  precioPromedio: number;
}

export interface IngresoDiario {
  fecha: string;
  ingresos: number;
  membresias: number;
  productos: number;
  transacciones: number;
}

export class ReportesClient {
  constructor(private readonly axios: AxiosInstance) {}

  async getIngresosDetallados(
    filtros: FiltrosIngresos = {},
  ): Promise<IngresosDetalladosResponse> {
    const params = new URLSearchParams();
    
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.metodoPago) params.append('metodoPago', filtros.metodoPago);

    const response = await this.axios.get<IngresosDetalladosResponse>(
      `/reportes/ingresos-detallados?${params.toString()}`,
    );
    return response.data;
  }

  async getProductosMasVendidos(
    limit: number = 10,
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<ProductoMasVendido[]> {
    const params = new URLSearchParams();
    
    params.append('limit', limit.toString());
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);

    const response = await this.axios.get<ProductoMasVendido[]>(
      `/reportes/productos-mas-vendidos?${params.toString()}`,
    );
    return response.data;
  }

  async getIngresosDiarios(dias: number = 30): Promise<IngresoDiario[]> {
    const response = await this.axios.get<IngresoDiario[]>(
      `/reportes/ingresos-diarios?dias=${dias}`,
    );
    return response.data;
  }
}