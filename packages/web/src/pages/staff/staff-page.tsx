import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft, Search, Users, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationModal } from '@/components/shared/confirmation-modal';
import { useDebounce } from '@/hooks/use-debounce';
import { TableSkeleton } from '@/components/shared/skeleton-loader';
import type { StaffResponseDto } from '@gym-saas/shared';

export function StaffPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  const [staff, setStaff] = useState<StaffResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    staffId: string | null;
    staffNombre: string;
  }>({
    isOpen: false,
    staffId: null,
    staffNombre: '',
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await apiClient.staff.findAll();
      setStaff(response.staff);
    } catch (error) {
      console.error('Error cargando staff:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el staff',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (member: StaffResponseDto) => {
    setDeleteModal({
      isOpen: true,
      staffId: member.id,
      staffNombre: `${member.nombre} ${member.apellido}`,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.staffId) return;

    try {
      setDeleting(true);
      await apiClient.staff.delete(deleteModal.staffId);

      toast({
        title: 'Staff eliminado',
        description: 'El miembro del staff ha sido eliminado correctamente',
      });

      await loadStaff();
      setDeleteModal({ isOpen: false, staffId: null, staffNombre: '' });
    } catch (error) {
      console.error('Error eliminando staff:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el miembro del staff',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActivo = async (member: StaffResponseDto) => {
    try {
      await apiClient.staff.update(member.id, {
        activo: !member.activo,
      });

      toast({
        title: 'Estado actualizado',
        description: `${member.nombre} ${member.activo ? 'desactivado' : 'activado'} correctamente`,
      });

      await loadStaff();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
    }
  };

  const filteredStaff = staff.filter((member) =>
    `${member.nombre} ${member.apellido} ${member.cargo}`
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Staff</h1>
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
              placeholder="Buscar staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {currentUser?.rol === 'admin' && (
            <button
              onClick={() => navigate('/staff/nuevo')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar Staff</span>
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : filteredStaff.length === 0 ? (
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">No se encontró staff</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza agregando miembros del equipo'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Foto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Redes Sociales
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
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.imagenUrl ? (
                        <img
                          src={member.imagenUrl}
                          alt={`${member.nombre} ${member.apellido}`}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${member.nombre}+${member.apellido}&background=random`;
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-lg">
                            {member.nombre.charAt(0)}
                            {member.apellido.charAt(0)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {member.nombre} {member.apellido}
                        </div>
                        {member.descripcion && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {member.descripcion}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                        {member.cargo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {member.instagram && (
                          <a
                            href={`https://instagram.com/${member.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:text-pink-800"
                          >
                            IG
                          </a>
                        )}
                        {member.facebook && (
                          <a
                            href={member.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            FB
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          member.activo
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {member.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleActivo(member)}
                          className={`${
                            member.activo
                              ? 'text-yellow-600 hover:text-yellow-800'
                              : 'text-green-600 hover:text-green-800'
                          } transition`}
                          title={member.activo ? 'Ocultar' : 'Mostrar'}
                        >
                          {member.activo ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>

                        <button
                          onClick={() => navigate(`/staff/${member.id}/editar`)}
                          className="text-indigo-600 hover:text-indigo-800 transition"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        {currentUser?.rol === 'admin' && (
                          <button
                            onClick={() => handleDeleteClick(member)}
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
        onClose={() => setDeleteModal({ isOpen: false, staffId: null, staffNombre: '' })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Staff"
        message={`¿Estás seguro de que deseas eliminar a ${deleteModal.staffNombre}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}