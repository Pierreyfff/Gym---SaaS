import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft, Search, MessageSquare, Star, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationModal } from '@/components/shared/confirmation-modal';
import { useDebounce } from '@/hooks/use-debounce';
import { TableSkeleton } from '@/components/shared/skeleton-loader';
import type { TestimonioResponseDto } from '@gym-saas/shared';

export function TestimoniosPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  const [testimonios, setTestimonios] = useState<TestimonioResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    testimonioId: string | null;
    clienteNombre: string;
  }>({
    isOpen: false,
    testimonioId: null,
    clienteNombre: '',
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTestimonios();
  }, []);

  const loadTestimonios = async () => {
    try {
      setLoading(true);
      const response = await apiClient.testimonios.findAll();
      setTestimonios(response.testimonios);
    } catch (error) {
      console.error('Error cargando testimonios:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los testimonios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (testimonio: TestimonioResponseDto) => {
    setDeleteModal({
      isOpen: true,
      testimonioId: testimonio.id,
      clienteNombre: testimonio.nombreCliente,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.testimonioId) return;

    try {
      setDeleting(true);
      await apiClient.testimonios.delete(deleteModal.testimonioId);

      toast({
        title: 'Testimonio eliminado',
        description: 'El testimonio ha sido eliminado correctamente',
      });

      await loadTestimonios();
      setDeleteModal({ isOpen: false, testimonioId: null, clienteNombre: '' });
    } catch (error) {
      console.error('Error eliminando testimonio:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el testimonio',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActivo = async (testimonio: TestimonioResponseDto) => {
    try {
      await apiClient.testimonios.update(testimonio.id, {
        activo: !testimonio.activo,
      });

      toast({
        title: 'Estado actualizado',
        description: `Testimonio ${testimonio.activo ? 'ocultado' : 'mostrado'} correctamente`,
      });

      await loadTestimonios();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
    }
  };

  const filteredTestimonios = testimonios.filter((testimonio) =>
    `${testimonio.nombreCliente} ${testimonio.contenido}`
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase()),
  );

  const renderStars = (calificacion: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < calificacion ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Testimonios</h1>
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
              placeholder="Buscar testimonios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {currentUser?.rol === 'admin' && (
            <button
              onClick={() => navigate('/testimonios/nuevo')}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar Testimonio</span>
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <TableSkeleton rows={8} columns={5} />
        ) : filteredTestimonios.length === 0 ? (
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">No se encontraron testimonios</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza agregando testimonios de clientes'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Testimonio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Calificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTestimonios.map((testimonio) => (
                  <tr key={testimonio.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {testimonio.imagenUrl ? (
                          <img
                            src={testimonio.imagenUrl}
                            alt={testimonio.nombreCliente}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${testimonio.nombreCliente}&background=random`;
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                            <span className="text-yellow-600 font-semibold">
                              {testimonio.nombreCliente.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {testimonio.nombreCliente}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                        {testimonio.contenido}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(testimonio.calificacion)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          testimonio.activo
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {testimonio.activo ? 'Visible' : 'Oculto'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleActivo(testimonio)}
                          className={`${
                            testimonio.activo
                              ? 'text-yellow-600 hover:text-yellow-800'
                              : 'text-green-600 hover:text-green-800'
                          } transition`}
                          title={testimonio.activo ? 'Ocultar' : 'Mostrar'}
                        >
                          {testimonio.activo ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>

                        <button
                          onClick={() => navigate(`/testimonios/${testimonio.id}/editar`)}
                          className="text-yellow-600 hover:text-yellow-800 transition"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        {currentUser?.rol === 'admin' && (
                          <button
                            onClick={() => handleDeleteClick(testimonio)}
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
        onClose={() => setDeleteModal({ isOpen: false, testimonioId: null, clienteNombre: '' })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Testimonio"
        message={`¿Estás seguro de que deseas eliminar el testimonio de ${deleteModal.clienteNombre}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}