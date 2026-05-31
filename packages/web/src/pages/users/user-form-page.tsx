import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';

interface UserFormData {
  email: string;
  password?:  string;
  nombre: string;
  apellido: string;
  telefono:  string;
  rol: 'admin' | 'recepcionista' | 'entrenador' | 'cliente';
  estado: 'activo' | 'inactivo';
}

export function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user:  currentUser } = useAuthStore();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    nombre:  '',
    apellido: '',
    telefono: '',
    rol: 'cliente',
    estado: 'activo',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const user = await apiClient.users.findOne(id);
      setFormData({
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        telefono: user.telefono || '',
        rol: user.rol,
        estado: user.estado,
      });
    } catch (error) {
      console.error('Error cargando usuario:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el usuario",
        variant: "destructive",
      });
      navigate('/usuarios');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    if (!isEditing && formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (isEditing && formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isEditing) {
        const updateData:  any = {
          email: formData.email,
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono || undefined,
          rol: formData.rol,
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        await apiClient.users.update(id!, updateData);

        toast({
          title: "Usuario actualizado",
          description:  "Los datos del usuario han sido actualizados correctamente",
        });
      } else {
        await apiClient.users.create({
          email: formData.email,
          password: formData.password! ,
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono || undefined,
          rol: formData.rol,
        });

        toast({
          title: "Usuario creado",
          description: "El usuario ha sido creado correctamente",
        });
      }

      navigate('/usuarios');
    } catch (error:  any) {
      console.error('Error guardando usuario:', error);
      const message = error.response?.data?.message || 'Error al guardar usuario';

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-950 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/usuarios')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentUser?.nombre} {currentUser?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg: px-8 py-8">
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ?  'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contraseña {! isEditing && <span className="text-red-500">*</span>}
                {isEditing && <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">(dejar vacío para no cambiar)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' :  'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={loading}
                  placeholder={isEditing ? 'Nueva contraseña (opcional)' : 'Mínimo 6 caracteres'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(! showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={loading}
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                )}
              </div>

              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.apellido ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={loading}
                />
                {errors.apellido && (
                  <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus: ring-blue-500 focus: border-transparent"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md: grid-cols-2 gap-4">
              <div>
                <label htmlFor="rol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rol <span className="text-red-500">*</span>
                </label>
                <select
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="cliente">Cliente</option>
                  <option value="entrenador">Entrenador</option>
                  <option value="recepcionista">Recepcionista</option>
                  {currentUser?.rol === 'admin' && <option value="admin">Admin</option>}
                </select>
              </div>

              {isEditing && (
                <div>
                  <label htmlFor="estado" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado
                  </label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={true}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">El estado solo se puede cambiar desde la lista de usuarios</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/usuarios')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                disabled={loading}
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}