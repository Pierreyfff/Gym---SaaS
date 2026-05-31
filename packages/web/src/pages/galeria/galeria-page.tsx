import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft, Search, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationModal } from '@/components/shared/confirmation-modal';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@/components/shared/skeleton-loader';
import type { ImagenGaleriaResponseDto } from '@gym-saas/shared';

export function GaleriaPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  const [imagenes, setImagenes] = useState<ImagenGaleriaResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    imagenId: string | null;
    imagenTitulo: string;
  }>({
    isOpen: false,
    imagenId: null,
    imagenTitulo: '',
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadImagenes();
  }, []);

  const loadImagenes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.galeria.findAll();
      setImagenes(response.imagenes);
    } catch (error) {
      console.error('Error cargando galería:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la galería',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (imagen: ImagenGaleriaResponseDto) => {
    setDeleteModal({
      isOpen: true,
      imagenId: imagen.id,
      imagenTitulo: imagen.titulo || 'esta imagen',
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.imagenId) return;

    try {
      setDeleting(true);
      await apiClient.galeria.delete(deleteModal.imagenId);

      toast({
        title: 'Imagen eliminada',
        description: 'La imagen ha sido eliminada correctamente',
      });

      await loadImagenes();
      setDeleteModal({ isOpen: false, imagenId: null, imagenTitulo: '' });
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la imagen',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActivo = async (imagen: ImagenGaleriaResponseDto) => {
    try {
      await apiClient.galeria.update(imagen.id, {
        activo: !imagen.activo,
      });

      toast({
        title: 'Estado actualizado',
        description: `Imagen ${imagen.activo ? 'ocultada' : 'mostrada'} correctamente`,
      });

      await loadImagenes();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
    }
  };

  const filteredImagenes = imagenes.filter((imagen) =>
    `${imagen.titulo || ''} ${imagen.descripcion || ''}`
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-950 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Galería de Imágenes</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentUser?.nombre} {currentUser?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar imágenes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {currentUser?.rol === 'admin' && (
            <button
              onClick={() => navigate('/galeria/nueva')}
              className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar Imagen</span>
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-950 rounded-lg shadow overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredImagenes.length === 0 ? (
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-8 text-center">
            <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">No se encontraron imágenes</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza agregando imágenes a la galería'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImagenes.map((imagen) => (
              <div key={imagen.id} className="bg-white dark:bg-gray-950 rounded-lg shadow overflow-hidden group relative">
                <img
                  src={imagen.url}
                  alt={imagen.titulo || 'Imagen'}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Error+cargando+imagen';
                  }}
                />
                
                {/* Overlay con acciones */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleToggleActivo(imagen)}
                    className="p-2 bg-white dark:bg-gray-950 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    title={imagen.activo ? 'Ocultar' : 'Mostrar'}
                  >
                    {imagen.activo ? (
                      <EyeOff className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    )}
                  </button>

                  <button
                    onClick={() => navigate(`/galeria/${imagen.id}/editar`)}
                    className="p-2 bg-white dark:bg-gray-950 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    title="Editar"
                  >
                    <Edit className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>

                  {currentUser?.rol === 'admin' && (
                    <button
                      onClick={() => handleDeleteClick(imagen)}
                      className="p-2 bg-white dark:bg-gray-950 rounded-full hover:bg-red-50 transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {imagen.titulo || 'Sin título'}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        imagen.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {imagen.activo ? 'Visible' : 'Oculto'}
                    </span>
                  </div>
                  {imagen.descripcion && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{imagen.descripcion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, imagenId: null, imagenTitulo: '' })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Imagen"
        message={`¿Estás seguro de que deseas eliminar ${deleteModal.imagenTitulo}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}