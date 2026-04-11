import { AxiosInstance } from 'axios';

export interface EstadisticasGenerales {
  totalClientes: number;
  clientesActivos: number;
  totalMembresias: number;
  membresiasActivas: number;
  membresiasExpiradas: number;
  membresiasCanceladas: number;
  totalIngresos: number;
  ingresosMesActual: number;
  ingresosMembresias: number;
  ingresosVentas: number;
  ingresosMembresiaMesActual: number;
  ingresosVentasMesActual: number;
  asistenciasMesActual: number;
}

export interface IngresosMensuales {
  mes: string;
  ingresos: number;
  cantidad: number;
}

export interface PlanMasVendido {
  planId: string;
  planNombre: string;
  cantidad: number;
  ingresos: number;
}

export interface AsistenciasPorMes {
  mes: string;
  cantidad: number;
}

export class EstadisticasClient {
  constructor(private readonly axios: AxiosInstance) {}

  async getEstadisticasGenerales(): Promise<EstadisticasGenerales> {
    const response = await this.axios.get<EstadisticasGenerales>('/estadisticas/generales');
    return response.data;
  }

  async getIngresosMensuales(): Promise<IngresosMensuales[]> {
    const response = await this.axios.get<IngresosMensuales[]>('/estadisticas/ingresos-mensuales');
    return response.data;
  }

  async getPlanesMasVendidos(): Promise<PlanMasVendido[]> {
    const response = await this.axios.get<PlanMasVendido[]>('/estadisticas/planes-mas-vendidos');
    return response.data;
  }

  async getAsistenciasPorMes(): Promise<AsistenciasPorMes[]> {
    const response = await this.axios.get<AsistenciasPorMes[]>('/estadisticas/asistencias-por-mes');
    return response.data;
  }
}