import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infrastructure/database/database.module';

// Controllers
import { CategoriaProductoController } from '@interface/controllers/categoria-producto.controller';
import { ProductoController } from '@interface/controllers/producto.controller';
import { VentaProductoController } from '@interface/controllers/venta-producto.controller';

// Use Cases - Categorías
import { CreateCategoriaUseCase } from '@application/use-cases/productos/categorias/create-categoria.use-case';
import { GetAllCategoriasUseCase } from '@application/use-cases/productos/categorias/get-all-categorias.use-case';
import { UpdateCategoriaUseCase } from '@application/use-cases/productos/categorias/update-categoria.use-case';
import { DeleteCategoriaUseCase } from '@application/use-cases/productos/categorias/delete-categoria.use-case';

// Use Cases - Productos
import { CreateProductoUseCase } from '@application/use-cases/productos/create-producto.use-case';
import { GetAllProductosUseCase } from '@application/use-cases/productos/get-all-productos.use-case';
import { GetProductoByIdUseCase } from '@application/use-cases/productos/get-producto-by-id.use-case';
import { UpdateProductoUseCase } from '@application/use-cases/productos/update-producto.use-case';
import { DeleteProductoUseCase } from '@application/use-cases/productos/delete-producto.use-case';
import { GetLowStockProductosUseCase } from '@application/use-cases/productos/get-low-stock-productos.use-case';

// Use Cases - Ventas
import { CreateVentaUseCase } from '@application/use-cases/ventas/create-venta.use-case';
import { GetAllVentasUseCase } from '@application/use-cases/ventas/get-all-ventas.use-case';
import { UpdateEstadoEnvioUseCase } from '@application/use-cases/ventas/update-estado-envio.use-case';

// Repositories
import { CategoriaProductoRepository } from '@infrastructure/repositories/categoria-producto.repository';
import { ProductoRepository } from '@infrastructure/repositories/producto.repository';
import { VentaProductoRepository } from '@infrastructure/repositories/venta-producto.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [
    CategoriaProductoController,
    ProductoController,
    VentaProductoController,
  ],
  providers: [
    // Use Cases - Categorías
    CreateCategoriaUseCase,
    GetAllCategoriasUseCase,
    UpdateCategoriaUseCase,
    DeleteCategoriaUseCase,

    // Use Cases - Productos
    CreateProductoUseCase,
    GetAllProductosUseCase,
    GetProductoByIdUseCase,
    UpdateProductoUseCase,
    DeleteProductoUseCase,
    GetLowStockProductosUseCase,

    // Use Cases - Ventas
    CreateVentaUseCase,
    GetAllVentasUseCase,
    UpdateEstadoEnvioUseCase,

    // Repositories
    {
      provide: 'ICategoriaProductoRepository',
      useClass: CategoriaProductoRepository,
    },
    {
      provide: 'IProductoRepository',
      useClass:  ProductoRepository,
    },
    {
      provide: 'IVentaProductoRepository',
      useClass: VentaProductoRepository,
    },
  ],
  exports: [
    'ICategoriaProductoRepository',
    'IProductoRepository',
    'IVentaProductoRepository',
  ],
})
export class ProductosModule {}