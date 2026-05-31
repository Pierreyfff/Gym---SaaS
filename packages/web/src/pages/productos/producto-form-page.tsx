import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';

interface Categoria {
  id: string;
  nombre: string;
}

interface ProductoFormData {
  nombre: string;
  descripcion: string;
  precio: string;
  stock: string;
  stockMinimo: string;
  categoriaId: string;
  imagenUrl: string;
  estado: string;
}

export function ProductoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<ProductoFormData>({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    stockMinimo: '5',
    categoriaId: '',
    imagenUrl: '',
    estado: 'activo',
  });

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadCategorias();
    if (isEdit) {
      loadProducto();
    }
  }, [id]);

  // Reset image error cuando cambia la URL
  useEffect(() => {
    setImageError(false);
  }, [formData.imagenUrl]);

  const loadCategorias = async () => {
    try {
      const response = await apiClient.categoriasProductos.findAll();
      setCategorias(response.categorias);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las categorías',
        variant: 'destructive',
      });
    }
  };

  const loadProducto = async () => {
    if (!id) return;

    try {
      setLoadingData(true);
      const producto = await apiClient.productos.findById(id);

      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio.toString(),
        stock: producto.stock.toString(),
        stockMinimo: producto.stockMinimo.toString(),
        categoriaId: producto.categoria?.id || '',
        imagenUrl: producto.imagenUrl || '',
        estado: producto.estado,
      });
    } catch (error) {
      console.error('Error cargando producto:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el producto',
        variant: 'destructive',
      });
      navigate('/productos');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.precio || !formData.stock) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa todos los campos obligatorios',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const dto = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        stockMinimo: parseInt(formData.stockMinimo),
        categoriaId: formData.categoriaId || undefined,
        imagenUrl: formData.imagenUrl.trim() || undefined,
        estado: formData.estado,
      };

      if (isEdit && id) {
        await apiClient.productos.update(id, dto);
        toast({
          title: 'Producto actualizado',
          description: 'El producto ha sido actualizado correctamente',
        });
      } else {
        await apiClient.productos.create(dto);
        toast({
          title: 'Producto creado',
          description: 'El producto ha sido creado correctamente',
        });
      }

      navigate('/productos');
    } catch (error: any) {
      console.error('Error guardando producto:', error);
      const message =
        error.response?.data?.message || 'Error al guardar el producto';

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Cargando producto...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-950 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/productos')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user?.nombre} {user?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna izquierda: Formulario */}
            <div className="lg:col-span-2 space-y-6">
              {/* Nombre */}
              <div>
                <label
                  htmlFor="nombre"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: Proteína Whey 1kg"
                />
              </div>

              {/* Descripción */}
              <div>
                <label
                  htmlFor="descripcion"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Descripción del producto..."
                />
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="precio"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Precio *
                  </label>
                  <input
                    type="number"
                    id="precio"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Stock *
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label
                    htmlFor="stockMinimo"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Mínimo *
                  </label>
                  <input
                    type="number"
                    id="stockMinimo"
                    name="stockMinimo"
                    value={formData.stockMinimo}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label
                  htmlFor="categoriaId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Categoría
                </label>
                <select
                  id="categoriaId"
                  name="categoriaId"
                  value={formData.categoriaId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Sin categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* URL Imagen */}
              <div>
                <label
                  htmlFor="imagenUrl"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  URL de Imagen
                </label>
                <input
                  type="url"
                  id="imagenUrl"
                  name="imagenUrl"
                  value={formData.imagenUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Pega la URL completa de la imagen del producto
                </p>
              </div>

              {/* Estado */}
              {isEdit && (
                <div>
                  <label
                    htmlFor="estado"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Estado
                  </label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              )}
            </div>

            {/* Columna derecha: Preview de Imagen */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vista Previa
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 aspect-square flex items-center justify-center">
                  {formData.imagenUrl && !imageError ? (
                    <img
                      src={formData.imagenUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="text-center p-6">
                      <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {imageError
                          ? 'Error al cargar imagen'
                          : 'Sin imagen'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/productos')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
              disabled={loading}
            >
              <Save className="w-5 h-5" />
              <span>
                {loading
                  ? 'Guardando...'
                  : isEdit
                  ? 'Actualizar'
                  : 'Crear Producto'}
              </span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}