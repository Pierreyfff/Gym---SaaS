import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft, Search, Users as UsersIcon } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ConfirmationModal } from '@/components/shared/confirmation-modal';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { TableSkeleton } from '@/components/shared/skeleton-loader';

interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  rol: 'admin' | 'recepcionista' | 'entrenador' | 'cliente';
  estado: 'activo' | 'inactivo';
  gimnasioId: string;
}

export function UsersPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [changingStatus, setChangingStatus] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: '',
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.users.findAll();
      setUsers(response.users);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (user.id === currentUser?.id) {
      toast({
        title: 'Acción no permitida',
        description: 'No puedes cambiar tu propio estado',
        variant: 'destructive',
      });
      return;
    }

    try {
      setChangingStatus(user.id);
      const newStatus = user.estado === 'activo' ? 'inactivo' : 'activo';

      await apiClient.users.changeStatus(user.id, { estado: newStatus });

      toast({
        title: 'Estado actualizado',
        description: `El usuario ahora está ${newStatus}`,
      });

      await loadUsers();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cambiar el estado del usuario',
        variant: 'destructive',
      });
    } finally {
      setChangingStatus(null);
    }
  };

  const handleDeleteClick = (user: User) => {
    setDeleteModal({
      isOpen: true,
      userId: user.id,
      userName: `${user.nombre} ${user.apellido}`,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.userId) return;

    try {
      setDeleting(true);
      await apiClient.users.delete(deleteModal.userId);

      toast({
        title: 'Usuario eliminado',
        description: 'El usuario ha sido eliminado correctamente',
      });

      await loadUsers();
      setDeleteModal({ isOpen: false, userId: null, userName: '' });
    } catch (error) {
      console.error('Error eliminando usuario:', error);

      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, userId: null, userName: '' });
  };

  const filteredUsers = users.filter((user) =>
    `${user.nombre} ${user.apellido} ${user.email}`
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase()),
  );

  const getRoleBadgeColor = (rol: string) => {
    const colors = {
      admin: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      recepcionista: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      entrenador: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      cliente: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    };
    return colors[rol as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Usuarios</h1>
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
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {currentUser?.rol === 'admin' && (
            <button
              onClick={() => navigate('/usuarios/nuevo')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Usuario</span>
            </button>
          )}
        </div>

        {loading ? (
          <TableSkeleton rows={10} columns={6} />
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-8 text-center">
            <UsersIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">No se encontraron usuarios</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza agregando tu primer usuario'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tel��fono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rol
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
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.nombre} {user.apellido}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{user.telefono || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                          user.rol,
                        )}`}
                      >
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {currentUser?.rol === 'admin' && user.id !== currentUser.id ? (
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={changingStatus === user.id}
                          className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                            user.estado === 'activo'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200'
                          } ${
                            changingStatus === user.id
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer'
                          }`}
                        >
                          {changingStatus === user.id ? 'Cambiando...' : user.estado}
                        </button>
                      ) : (
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.estado === 'activo'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {user.estado}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/usuarios/${user.id}/editar`)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        {currentUser?.rol === 'admin' && user.id !== currentUser.id && (
                          <button
                            onClick={() => handleDeleteClick(user)}
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
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar a ${deleteModal.userName}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}