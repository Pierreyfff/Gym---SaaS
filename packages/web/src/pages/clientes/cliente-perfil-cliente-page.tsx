import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layouts/public-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/hooks/use-toast';
import { User, Pencil, Save, X, ArrowLeft, RefreshCw } from 'lucide-react';

interface PerfilCliente {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
}

export function ClientePerfilClientePage() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [cargandoUsuario, setCargandoUsuario] = useState(false);
  const [perfil, setPerfil] = useState<PerfilCliente>({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    telefono: '',
    fechaNacimiento: '',
  });

  useEffect(() => {
    if (user) {
      loadPerfil();
    }
  }, [user]);

  const loadPerfil = async () => {
    try {
      setLoading(true);
      const data = await apiClient.clientes.getPerfilCompleto(user!.id);
      setPerfil({
        nombre: data.cliente.nombre || user?.nombre || '',
        apellido: data.cliente.apellido || user?.apellido || '',
        email: data.cliente.email || user?.email || '',
        telefono: data.cliente.telefono || '',
        fechaNacimiento: data.cliente.fechaNacimiento
          ? new Date(data.cliente.fechaNacimiento).toISOString().split('T')[0]
          : '',
      });
    } catch (err) {
      console.error('Error cargando perfil completo, usando datos de auth:', err);
      // Fallback: usar datos del usuario autenticado + intentar con /auth/me
      try {
        setCargandoUsuario(true);
        const userData = await apiClient.auth.getCurrentUser();
        setPerfil({
          nombre: userData.nombre || user?.nombre || '',
          apellido: userData.apellido || user?.apellido || '',
          email: userData.email || user?.email || '',
          telefono: userData.telefono || '',
          fechaNacimiento: '',
        });
      } catch {
        toast({
          title: 'Error',
          description: 'No se pudo cargar tu perfil. Intenta recargar la página.',
          variant: 'destructive',
        });
      } finally {
        setCargandoUsuario(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof PerfilCliente, value: string) => {
    setPerfil((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.clientes.update(user!.id, {
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        email: perfil.email,
        telefono: perfil.telefono || undefined,
        fechaNacimiento: perfil.fechaNacimiento || undefined,
      });
      toast({
        title: 'Perfil actualizado',
        description: 'Tus datos se han guardado correctamente',
      });
      setEditing(false);
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar tu perfil',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    loadPerfil();
    setEditing(false);
  };

  if (loading || cargandoUsuario) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-pulse text-gray-600">Cargando perfil...</div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/cliente/dashboard"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al panel
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadPerfil}
              className="text-gray-500"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Recargar
            </Button>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-purple-600" />
                  <CardTitle className="text-2xl">Mi Perfil</CardTitle>
                </div>
                {!editing ? (
                  <Button
                    variant="outline"
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  {editing ? (
                    <Input
                      id="nombre"
                      value={perfil.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {perfil.nombre || 'No registrado'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  {editing ? (
                    <Input
                      id="apellido"
                      value={perfil.apellido}
                      onChange={(e) => handleChange('apellido', e.target.value)}
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {perfil.apellido || 'No registrado'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {editing ? (
                    <Input
                      id="email"
                      type="email"
                      value={perfil.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {perfil.email || 'No registrado'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  {editing ? (
                    <Input
                      id="telefono"
                      value={perfil.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {perfil.telefono || 'No registrado'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                  {editing ? (
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      value={perfil.fechaNacimiento}
                      onChange={(e) =>
                        handleChange('fechaNacimiento', e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {perfil.fechaNacimiento
                        ? new Date(
                            perfil.fechaNacimiento
                          ).toLocaleDateString('es-PE')
                        : 'No registrada'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
