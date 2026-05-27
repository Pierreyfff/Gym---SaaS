import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ConfirmationModal } from '@/components/shared/confirmation-modal';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/format';
import { useDebounce } from '@/hooks/use-debounce';
import { TableSkeleton } from '@/components/shared/skeleton-loader';

interface Producto {
  id: string;
  gimnasioId: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  imagenUrl?: string;
  estado: string;
  categoria?: {
    id: string;
    nombre: string;
  };
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export function ProductosPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productoId: string | null;
    productoNombre: string;
  }>({
    isOpen: false,
    productoId: null,
    productoNombre: '',
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.productos.findAll();
      setProductos(response.productos as Producto[]);
    } catch (error) {
      console.error('Error cargando productos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los productos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (producto: Producto) => {
    setDeleteModal({
      isOpen: true,
      productoId: producto.id,
      productoNombre: producto.nombre,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.productoId) return;

    try {
      setDeleting(true);
      await apiClient.productos.delete(deleteModal.productoId);

      toast({
        title: 'Producto eliminado',
        description: 'El producto ha sido eliminado correctamente',
      });

      await loadProductos();
      setDeleteModal({ isOpen: false, productoId: null, productoNombre: '' });
    } catch (error) {
      console.error('Error eliminando producto:', error);

      toast({
        title: 'Error',
        description: 'No se pudo eliminar el producto',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, productoId: null, productoNombre: '' });
  };

  const handleToggleEstado = async (producto: Producto) => {
    try {
      const nuevoEstado = producto.estado === 'activo' ? 'inactivo' : 'activo';

      await apiClient.productos.update(producto.id, { estado: nuevoEstado });

      toast({
        title: 'Estado actualizado',
        description: `El producto ha sido ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}`,
      });

      await loadProductos();
    } catch (error) {
      console.error('Error actualizando estado:', error);

      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del producto',
        variant: 'destructive',
      });
    }
  };

  const productosSinStock = productos.filter((p) => p.stock === 0);
  const productosStockBajo = productos.filter((p) => p.stock > 0 && p.stock <= p.stockMinimo);

  const getStockBadgeColor = (stock: number, stockMinimo: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock <= stockMinimo) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const filteredProductos = productos.filter((producto) =>
    `${producto.nombre} ${producto.categoria?.nombre || ''}`
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {currentUser?.nombre} {currentUser?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alertas de stock */}
        {(productosSinStock.length > 0 || productosStockBajo.length > 0) && (
          <div className="mb-6 space-y-3">
            {productosSinStock.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">
                    {productosSinStock.length} producto(s) sin stock
                  </p>
                  <p className="text-sm text-red-700">
                    {productosSinStock.map((p) => p.nombre).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {productosStockBajo.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    {productosStockBajo.length} producto(s) con stock bajo
                  </p>
                  <p className="text-sm text-yellow-700">
                    {productosStockBajo.map((p) => `${p.nombre} (${p.stock})`).join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/productos/categorias')}
              className="flex items-center gap-2 px-4 py-2 border border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold rounded-lg transition"
            >
              <Package className="w-5 h-5" />
              <span>Categorías</span>
            </button>

            {currentUser?.rol === 'admin' && (
              <button
                onClick={() => navigate('/productos/nuevo')}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
                <span>Nuevo Producto</span>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <TableSkeleton rows={10} columns={6} />
        ) : filteredProductos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">No se encontraron productos</p>
            <p className="text-sm text-gray-500">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza agregando tu primer producto'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProductos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                        {producto.descripcion && (
                          <div className="text-sm text-gray-500">{producto.descripcion}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {producto.categoria?.nombre || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-purple-600">
                        {formatCurrency(producto.precio)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockBadgeColor(
                          producto.stock,
                          producto.stockMinimo,
                        )}`}
                      >
                        {producto.stock} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          producto.estado === 'activo'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {producto.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleEstado(producto)}
                          className={`${
                            producto.estado === 'activo'
                              ? 'text-green-600 hover:text-green-800'
                              : 'text-gray-600 hover:text-gray-800'
                          } transition`}
                          title={producto.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        >
                          {producto.estado === 'activo' ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={() => navigate(`/productos/${producto.id}/editar`)}
                          className="text-purple-600 hover:text-purple-800 transition"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        {currentUser?.rol === 'admin' && (
                          <button
                            onClick={() => handleDeleteClick(producto)}
                            className="text-red-600 hover:text-red-800 transition"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Producto"
        message={`¿Estás seguro de que deseas eliminar ${deleteModal.productoNombre}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}