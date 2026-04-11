import { AxiosInstance } from 'axios';
import { createApiClient, ApiClientConfig } from './config/axios-config';
import { AuthClient } from './clients/auth.client';
import { UsersClient } from './clients/users.client';
import { ClientesClient } from './clients/clientes.client';
import { PlanesClient } from './clients/planes.client';
import { MembresiasClient } from './clients/membresias.client';
import { PagosClient } from './clients/pagos.client';
import { AsistenciasClient } from './clients/asistencias.client';
import { InscripcionesClient } from './clients/inscripciones.client';
import { EstadisticasClient } from './clients/estadisticas.client';
import { ConfiguracionGimnasioClient } from './clients/configuracion-gimnasio.client';
import { CategoriaProductoClient } from './clients/categoria-producto.client';
import { ProductoClient } from './clients/producto.client';
import { VentaProductoClient } from './clients/venta-producto.client';
import { ReportesClient } from './clients/reportes.client';
import { StaffClient } from './clients/staff.client';
import { TestimoniosClient } from './clients/testimonios.client';
import { GaleriaClient } from './clients/galeria.client';
import { PublicClient } from './clients/public.client';

export class GymSaasApiClient {
  private axiosInstance: AxiosInstance;

  public readonly auth: AuthClient;
  public readonly users: UsersClient;
  public readonly clientes: ClientesClient;
  public readonly planes: PlanesClient;
  public readonly membresias: MembresiasClient;
  public readonly pagos: PagosClient; // ← AGREGAR
  public readonly asistencias: AsistenciasClient; // ← AGREGAR
  public readonly inscripciones: InscripcionesClient; // ← AGREGAR
  public readonly estadisticas: EstadisticasClient;
  public readonly configuracion: ConfiguracionGimnasioClient;
  public readonly categoriasProductos: CategoriaProductoClient;
  public readonly productos: ProductoClient;
  public readonly ventasProductos: VentaProductoClient;
  public readonly reportes: ReportesClient;
  public readonly staff: StaffClient;
  public readonly testimonios: TestimoniosClient;
  public readonly galeria: GaleriaClient;
  public readonly public: PublicClient;

  constructor(config: ApiClientConfig) {
    this.axiosInstance = createApiClient(config);

    // Inicializar todos los clientes
    this.auth = new AuthClient(this.axiosInstance);
    this.users = new UsersClient(this.axiosInstance);
    this.clientes = new ClientesClient(this.axiosInstance);
    this.planes = new PlanesClient(this.axiosInstance);
    this.membresias = new MembresiasClient(this.axiosInstance);
    this.pagos = new PagosClient(this.axiosInstance); // ← AGREGAR
    this.asistencias = new AsistenciasClient(this.axiosInstance); // ← AGREGAR
    this.inscripciones = new InscripcionesClient(this.axiosInstance); // ← AGREGAR
    this.estadisticas = new EstadisticasClient(this.axiosInstance);
    this.configuracion = new ConfiguracionGimnasioClient(this.axiosInstance);
    this.categoriasProductos = new CategoriaProductoClient(this.axiosInstance);
    this.productos = new ProductoClient(this.axiosInstance);
    this.ventasProductos = new VentaProductoClient(this.axiosInstance);
    this.reportes = new ReportesClient(this.axiosInstance);
    this.staff = new StaffClient(this.axiosInstance);
    this.testimonios = new TestimoniosClient(this.axiosInstance);
    this.galeria = new GaleriaClient(this.axiosInstance);
    this.public = new PublicClient(this.axiosInstance);
  }

  // Método para obtener la instancia de axios (por si se necesita hacer requests custom)
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Re-exportar solo tipos y configuración
export * from './config/axios-config';
export * from './clients/auth.client';
export * from './clients/users.client';
export * from './clients/clientes.client';
export * from './clients/planes.client';
export * from './clients/membresias.client';
export * from './clients/pagos.client'; // ← AGREGAR
export * from './clients/asistencias.client'; // ← AGREGAR al final
export * from './clients/inscripciones.client'; // ← AGREGAR al final
export * from './clients/estadisticas.client';
export * from './clients/configuracion-gimnasio.client';
export * from './clients/categoria-producto.client';
export * from './clients/producto.client';
export * from './clients/venta-producto.client';
export * from './clients/reportes.client';
export * from './clients/staff.client'
export * from './clients/testimonios.client';
export * from './clients/galeria.client';
export * from './clients/public.client';

// ❌ NO re-exportar shared (causa problemas con Vite)
// export * from '@gym-saas/shared';
