import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ConfirmationModal } from '@/components/shared/confirmation-modal';
import { useToast } from '@/hooks/use-toast';

interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
}

export function CategoriasPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    categoriaId: string | null;
    categoriaNombre: string;
  }>({
    isOpen:  false,
    categoriaId:  null,
    categoriaNombre: '',
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      const response = await apiClient.categoriasProductos.findAll();
      setCategorias(response.categorias);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las categorías',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre) {
      toast({
        title: 'Campo requerido',
        description:  'El nombre es obligatorio',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await apiClient.categoriasProductos.update(editingId, formData);
        toast({
          title: 'Categoría actualizada',
          description: 'La categoría ha sido actualizada correctamente',
        });
      } else {
        await apiClient.categoriasProductos.create(formData);
        toast({
          title: 'Categoría creada',
          description:  'La categoría ha sido creada correctamente',
        });
      }

      setFormData({ nombre: '', descripcion:  '' });
      setShowForm(false);
      setEditingId(null);
      await loadCategorias();
    } catch (error: any) {
      console.error('Error guardando categoría:', error);
      const message = error.response?.data?.message || 'Error al guardar la categoría';

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingId(categoria.id);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
    });
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setFormData({ nombre: '', descripcion:  '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleDeleteClick = (categoria: Categoria) => {
    setDeleteModal({
      isOpen: true,
      categoriaId: categoria.id,
      categoriaNombre: categoria.nombre,
    });
  };

  const handleDeleteConfirm = async () => {
    if (! deleteModal.categoriaId) return;

    try {
      setDeleting(true);
      await apiClient.categoriasProductos.delete(deleteModal.categoriaId);

      toast({
        title: 'Categoría eliminada',
        description: 'La categoría ha sido eliminada correctamente',
      });

      await loadCategorias();
      setDeleteModal({ isOpen: false, categoriaId: null, categoriaNombre: '' });
    } catch (error) {
      console.error('Error eliminando categoría:', error);

      toast({
        title: 'Error',
        description: 'No se pudo eliminar la categoría',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, categoriaId: null, categoriaNombre: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg: px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/productos')}
              className="text-gray-600 hover: text-gray-900 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Categorías de Productos</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.nombre} {user?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg: px-8 py-8">
        {/* Formulario */}
        {showForm ?  (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ?  'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e. target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej:  Suplementos"
                />
              </div>

              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  value={formData. descripcion}
                  onChange={(e) => setFormData({ ... formData, descripcion: e. target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Descripción opcional..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                  disabled={saving}
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                  disabled={saving}
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Nueva Categoría
            </button>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Cargando categorías... </p>
          </div>
        ) : categorias.length === 0 ?  (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No hay categorías creadas</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {categorias.map((categoria) => (
                <li key={categoria.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{categoria.nombre}</h3>
                      {categoria.descripcion && (
                        <p className="text-sm text-gray-600 mt-1">{categoria. descripcion}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(categoria)}
                        className="text-purple-600 hover:text-purple-800 transition"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      {user?.rol === 'admin' && (
                        <button
                          onClick={() => handleDeleteClick(categoria)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Categoría"
        message={`¿Estás seguro de que deseas eliminar la categoría "${deleteModal.categoriaNombre}"?  Los productos asociados quedarán sin categoría.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}