import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import type { CreateImagenGaleriaDto } from '@gym-saas/shared';

interface GaleriaFormData extends CreateImagenGaleriaDto {
  id?: string;
}

export function GaleriaFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<GaleriaFormData>({
    url: '',
    titulo: '',
    descripcion: '',
    orden: 0,
    activo: true,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      loadImagen(id);
    }
  }, [id, isEditing]);

  const loadImagen = async (imagenId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.galeria.findAll();
      const imagen = response.imagenes.find((img) => img.id === imagenId);

      if (!imagen) {
        toast({
          title: 'Error',
          description: 'Imagen no encontrada',
          variant: 'destructive',
        });
        navigate('/galeria');
        return;
      }

      setFormData({
        url: imagen.url,
        titulo: imagen.titulo || '',
        descripcion: imagen.descripcion || '',
        orden: imagen.orden,
        activo: imagen.activo,
      });
    } catch (error) {
      console.error('Error cargando imagen:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la imagen',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url.trim()) {
      toast({
        title: 'Campo requerido',
        description: 'Por favor ingresa la URL de la imagen',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      if (isEditing && id) {
        await apiClient.galeria.update(id, formData);
        toast({
          title: 'Imagen actualizada',
          description: 'Los cambios han sido guardados correctamente',
        });
      } else {
        await apiClient.galeria.create(formData);
        toast({
          title: 'Imagen agregada',
          description: 'La imagen ha sido agregada a la galería',
        });
      }

      navigate('/galeria');
    } catch (error) {
      console.error('Error guardando imagen:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la imagen',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-950 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/galeria')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? 'Editar Imagen' : 'Agregar Imagen'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentUser?.nombre} {currentUser?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <ImageIcon className="w-6 h-6 text-pink-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Información de la Imagen</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL de la Imagen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Ingresa la URL completa de la imagen
              </p>
            </div>

            {formData.url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vista Previa
                </label>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                  <img
                    src={formData.url}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Error+cargando+imagen';
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título (Opcional)
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Área de pesas"
              />
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción (Opcional)
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                placeholder="Vista del área de entrenamiento con pesas..."
              />
            </div>

            <div>
              <label htmlFor="orden" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Orden de Visualización
              </label>
              <input
                type="number"
                id="orden"
                name="orden"
                value={formData.orden}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Menor número aparece primero en la galería
              </p>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="w-5 h-5 text-pink-600 rounded focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mostrar en la galería pública
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/galeria')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
              disabled={saving}
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Agregar Imagen'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}