import { useAuthStore } from '@/lib/stores/auth-store';
import { PublicLayout } from '@/components/layouts/public-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingBag, CreditCard, MapPin, LogOut } from 'lucide-react';

export function ClienteDashboardPage() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Bienvenido, {user?.nombre}
              </h1>
              <p className="text-gray-600 mt-2">Panel de Cliente</p>
            </div>
          </div>

          {/* Grid de opciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Perfil */}
            <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate('/cliente/perfil')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-6 h-6 text-purple-600" />
                  Mi Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Ver y editar tu información personal
                </p>
              </CardContent>
            </Card>

            {/* Mis Compras */}
            <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate('/cliente/compras')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-purple-600" />
                  Mis Compras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Historial de compras y pedidos
                </p>
              </CardContent>
            </Card>

            {/* Membresía */}
            <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate('/cliente/membresia')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                  Mi Membresía
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Estado de tu membresía actual
                </p>
              </CardContent>
            </Card>

            {/* Tienda */}
            <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate('/tienda')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-purple-600" />
                  Tienda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Compra productos y suplementos
                </p>
              </CardContent>
            </Card>

            {/* Ubicación */}
            <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate('/contacto')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-purple-600" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Cómo llegar al gimnasio
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Información adicional */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Información de tu cuenta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Email:</span> {user?.email}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Nombre completo:</span> {user?.nombre} {user?.apellido}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Rol:</span> {user?.rol}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}