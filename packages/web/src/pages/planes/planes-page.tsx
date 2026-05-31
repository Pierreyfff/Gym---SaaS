import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft, Search, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ConfirmationModal } from '@/components/shared/confirmation-modal';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/format';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@/components/shared/skeleton-loader';

interface Plan {
  id: string;
  gimnasioId: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionDias: number;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export function PlanesPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    planId: string | null;
    planName: string;
  }>({
    isOpen: false,
    planId: null,
    planName: '',
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadPlanes();
  }, []);

  const loadPlanes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.planes.findAll();
      setPlanes(response.planes);
    } catch (error) {
      console.error('Error cargando planes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los planes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (plan: Plan) => {
    setDeleteModal({
      isOpen: true,
      planId: plan.id,
      planName: plan.nombre,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.planId) return;

    try {
      setDeleting(true);
      await apiClient.planes.delete(deleteModal.planId);

      toast({
        title: 'Plan eliminado',
        description: 'El plan ha sido eliminado correctamente',
      });

      await loadPlanes();
      setDeleteModal({ isOpen: false, planId: null, planName: '' });
    } catch (error: any) {
      console.error('Error eliminando plan:', error);

      const errorMessage =
        error?.response?.data?.message || error?.message || 'No se pudo eliminar el plan';

      toast({
        title: 'Error al eliminar',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, planId: null, planName: '' });
  };

  const filteredPlanes = planes.filter((plan) =>
    plan.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  const formatDuration = (days: number) => {
    if (days === 30) return '1 mes';
    if (days === 90) return '3 meses';
    if (days === 180) return '6 meses';
    if (days === 365) return '1 año';
    return `${days} días`;
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Planes</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentUser?.nombre} {currentUser?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar planes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {currentUser?.rol === 'admin' && (
            <button
              onClick={() => navigate('/planes/nuevo')}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Plan</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 border-t-4 border-gray-200 dark:border-gray-700">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-6" />
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center py-2 border-b">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPlanes.length === 0 ? (
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">No se encontraron planes</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza agregando tu primer plan'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlanes.map((plan) => (
              <div
                key={plan.id}
                className="bg-white dark:bg-gray-950 rounded-lg shadow hover:shadow-lg transition p-6 border-t-4 border-purple-500"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{plan.nombre}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 min-h-[40px]">
                    {plan.descripcion || 'Sin descripción'}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Precio:</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {formatCurrency(plan.precio)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Duración:</span>
                    <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {formatDuration(plan.duracionDias)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => navigate(`/planes/${plan.id}/editar`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Editar</span>
                  </button>
                  {currentUser?.rol === 'admin' && (
                    <button
                      onClick={() => handleDeleteClick(plan)}
                      className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Plan"
        message={`¿Estás seguro de que deseas eliminar el plan "${deleteModal.planName}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}