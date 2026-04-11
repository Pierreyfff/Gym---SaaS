import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, MessageSquare, Star } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import type { CreateTestimonioDto } from '@gym-saas/shared';

interface TestimonioFormData extends CreateTestimonioDto {
  id?: string;
}

export function TestimonioFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<TestimonioFormData>({
    nombreCliente: '',
    contenido: '',
    calificacion: 5,
    imagenUrl: '',
    orden: 0,
    activo: true,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      loadTestimonio(id);
    }
  }, [id, isEditing]);

  const loadTestimonio = async (testimonioId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.testimonios.findAll();
      const testimonio = response.testimonios.find(
        (t) => t.id === testimonioId,
      );

      if (!testimonio) {
        toast({
          title: 'Error',
          description: 'Testimonio no encontrado',
          variant: 'destructive',
        });
        navigate('/testimonios');
        return;
      }

      setFormData({
        nombreCliente: testimonio.nombreCliente,
        contenido: testimonio.contenido,
        calificacion: testimonio.calificacion,
        imagenUrl: testimonio.imagenUrl || '',
        orden: testimonio.orden,
        activo: testimonio.activo,
      });
    } catch (error) {
      console.error('Error cargando testimonio:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el testimonio',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombreCliente.trim() || !formData.contenido.trim()) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa nombre del cliente y testimonio',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      if (isEditing && id) {
        await apiClient.testimonios.update(id, formData);
        toast({
          title: 'Testimonio actualizado',
          description: 'Los cambios han sido guardados correctamente',
        });
      } else {
        await apiClient.testimonios.create(formData);
        toast({
          title: 'Testimonio creado',
          description: 'El testimonio ha sido agregado correctamente',
        });
      }

      navigate('/testimonios');
    } catch (error) {
      console.error('Error guardando testimonio:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el testimonio',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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

  const renderStarInput = () => {
    return (
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() =>
              setFormData({ ...formData, calificacion: index + 1 })
            }
            className="focus:outline-none"
          >
            <Star
              className={`w-8 h-8 transition ${
                index < (formData.calificacion ?? 5)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/testimonios')}
              className="text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Testimonio' : 'Agregar Testimonio'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {currentUser?.nombre} {currentUser?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6 space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Información del Testimonio
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="nombreCliente"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre del Cliente <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nombreCliente"
                name="nombreCliente"
                value={formData.nombreCliente}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="María González"
              />
            </div>

            <div>
              <label
                htmlFor="contenido"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Testimonio <span className="text-red-500">*</span>
              </label>
              <textarea
                id="contenido"
                name="contenido"
                value={formData.contenido}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                placeholder="Excelente gimnasio, los entrenadores son muy profesionales..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.contenido.length} caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calificación <span className="text-red-500">*</span>
              </label>
              {renderStarInput()}
              <p className="text-xs text-gray-500 mt-1">
                {formData.calificacion} de 5 estrellas
              </p>
            </div>

            <div>
              <label
                htmlFor="imagenUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL de Imagen (Opcional)
              </label>
              <input
                type="text"
                id="imagenUrl"
                name="imagenUrl"
                value={formData.imagenUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="https://ejemplo.com/foto.jpg"
              />
              {formData.imagenUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imagenUrl}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${formData.nombreCliente}&background=random`;
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="orden"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Orden de Visualización
              </label>
              <input
                type="number"
                id="orden"
                name="orden"
                value={formData.orden}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Menor número aparece primero
              </p>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Mostrar en la web pública
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/testimonios')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
              disabled={saving}
            >
              <Save className="w-5 h-5" />
              <span>
                {saving
                  ? 'Guardando...'
                  : isEditing
                    ? 'Guardar Cambios'
                    : 'Crear Testimonio'}
              </span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
