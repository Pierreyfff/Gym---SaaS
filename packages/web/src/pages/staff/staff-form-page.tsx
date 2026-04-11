import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Users } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import type { CreateStaffDto } from '@gym-saas/shared';

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  telefono?: string;
}

interface StaffFormData extends CreateStaffDto {
  id?: string;
}

export function StaffFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  const isEditing = Boolean(id);

  const [entrenadores, setEntrenadores] = useState<Usuario[]>([]);
  const [formData, setFormData] = useState<StaffFormData>({
    usuarioId: undefined,
    nombre: '',
    apellido: '',
    cargo: '',
    descripcion: '',
    imagenUrl: '',
    orden: 0,
    instagram: '',
    facebook: '',
    activo: true,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isVinculado, setIsVinculado] = useState(false);

  useEffect(() => {
    loadEntrenadores();
    if (isEditing && id) {
      loadStaff(id);
    }
  }, [id, isEditing]);

  const loadEntrenadores = async () => {
    try {
      const response = await apiClient.users.findAll();
      // Filtrar solo entrenadores y admins
      const trainers = response.users.filter(
        (u: Usuario) => u.rol === 'entrenador' || u.rol === 'admin',
      );
      setEntrenadores(trainers);
    } catch (error) {
      console.error('Error cargando entrenadores:', error);
    }
  };

  const loadStaff = async (staffId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.staff.findAll();
      const member = response.staff.find((s) => s.id === staffId);

      if (!member) {
        toast({
          title: 'Error',
          description: 'Staff no encontrado',
          variant: 'destructive',
        });
        navigate('/staff');
        return;
      }

      setFormData({
        usuarioId: member.usuarioId,
        nombre: member.nombre || '',
        apellido: member.apellido || '',
        cargo: member.cargo,
        descripcion: member.descripcion || '',
        imagenUrl: member.imagenUrl || '',
        orden: member.orden,
        instagram: member.instagram || '',
        facebook: member.facebook || '',
        activo: member.activo,
      });

      setIsVinculado(Boolean(member.usuarioId));
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

  const handleUsuarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const usuarioId = e.target.value;

    if (!usuarioId) {
      setFormData((prev) => ({
        ...prev,
        usuarioId: undefined,
        nombre: '',
        apellido: '',
      }));
      setIsVinculado(false);
      return;
    }

    const usuario = entrenadores.find((u) => u.id === usuarioId);
    if (usuario) {
      setFormData((prev) => ({
        ...prev,
        usuarioId: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
      }));
      setIsVinculado(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obligatorios
    if (!formData.cargo.trim()) {
      toast({
        title: 'Campo requerido',
        description: 'Por favor completa el cargo',
        variant: 'destructive',
      });
      return;
    }

    // Si no está vinculado, validar nombre y apellido
    if (!formData.usuarioId && (!formData.nombre?.trim() || !formData.apellido?.trim())) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa nombre y apellido, o selecciona un usuario existente',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      if (isEditing && id) {
        await apiClient.staff.update(id, formData);
        toast({
          title: 'Staff actualizado',
          description: 'Los cambios han sido guardados correctamente',
        });
      } else {
        await apiClient.staff.create(formData);
        toast({
          title: 'Staff creado',
          description: 'El miembro del staff ha sido agregado correctamente',
        });
      }

      navigate('/staff');
    } catch (error) {
      console.error('Error guardando staff:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el staff',
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
              onClick={() => navigate('/staff')}
              className="text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Staff' : 'Agregar Staff'}
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
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Información del Staff</h2>
          </div>

          {/* NUEVO: Selector de Usuario Entrenador */}
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-indigo-900">Vincular con Usuario Existente</h3>
            </div>
            <select
              value={formData.usuarioId || ''}
              onChange={handleUsuarioChange}
              className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">-- Crear Staff Independiente --</option>
              {entrenadores.map((entrenador) => (
                <option key={entrenador.id} value={entrenador.id}>
                  {entrenador.nombre} {entrenador.apellido} ({entrenador.rol}) - {entrenador.email}
                </option>
              ))}
            </select>
            <p className="text-xs text-indigo-600 mt-2">
              {isVinculado
                ? '✓ Los datos de nombre y apellido se tomarán del usuario seleccionado'
                : 'Si no seleccionas un usuario, completa manualmente nombre y apellido'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre {!isVinculado && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre || ''}
                onChange={handleChange}
                required={!isVinculado}
                disabled={isVinculado}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  isVinculado ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Juan"
              />
            </div>

            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
                Apellido {!isVinculado && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido || ''}
                onChange={handleChange}
                required={!isVinculado}
                disabled={isVinculado}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  isVinculado ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Pérez"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
                Cargo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Entrenador Personal"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Especialista en entrenamiento funcional con 5 años de experiencia..."
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="imagenUrl" className="block text-sm font-medium text-gray-700 mb-1">
                URL de Imagen
              </label>
              <input
                type="text"
                id="imagenUrl"
                name="imagenUrl"
                value={formData.imagenUrl || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://ejemplo.com/foto.jpg"
              />
              {formData.imagenUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imagenUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${formData.nombre || 'User'}+${formData.apellido || ''}&background=random`;
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <input
                type="text"
                id="instagram"
                name="instagram"
                value={formData.instagram || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="@usuario"
              />
            </div>

            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                Facebook
              </label>
              <input
                type="text"
                id="facebook"
                name="facebook"
                value={formData.facebook || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://facebook.com/usuario"
              />
            </div>

            <div>
              <label htmlFor="orden" className="block text-sm font-medium text-gray-700 mb-1">
                Orden de Visualización
              </label>
              <input
                type="number"
                id="orden"
                name="orden"
                value={formData.orden || 0}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Menor número aparece primero</p>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo ?? true}
                  onChange={handleChange}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Mostrar en la web pública</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/staff')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
              disabled={saving}
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Staff'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}