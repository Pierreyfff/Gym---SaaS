import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layouts/public-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/client';
import { formatCurrency } from '@/lib/format';
import { CreditCard, Calendar, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import type { MembresiaResponseDto } from '@gym-saas/shared';

export function ClienteMembresiaPage() {
  const { user } = useAuthStore();
  const [membresia, setMembresia] = useState<MembresiaResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMembresia();
    }
  }, [user]);

  const loadMembresia = async () => {
    try {
      setLoading(true);
      const data = await apiClient.membresias.findByCliente(user!.id);
      const activa = data.membresias.find((m) => m.estado === 'activa') || data.membresias[0] || null;
      setMembresia(activa);
    } catch {
      setMembresia(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getProgressPercent = () => {
    if (!membresia) return 0;
    const total = membresia.plan.duracionDias;
    const transcurridos = total - (membresia.diasRestantes ?? 0);
    return Math.round((transcurridos / total) * 100);
  };

  const getEstadoVariant = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'default' as const;
      case 'expirada':
        return 'destructive' as const;
      case 'cancelada':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-pulse text-gray-600 dark:text-gray-400">
            Cargando membresía...
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              to="/cliente/dashboard"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al panel
            </Link>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-purple-600" />
                <CardTitle className="text-2xl">Mi Membresía</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {!membresia ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                    No tienes una membresía activa
                  </p>
                  <Link to="/planes-publicos">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Ver Planes Disponibles
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {membresia.plan.nombre}
                      </h3>
                      <p className="text-3xl font-bold text-purple-600 mt-2">
                        {formatCurrency(membresia.plan.precio)}
                      </p>
                    </div>
                    <Badge variant={getEstadoVariant(membresia.estado)}>
                      {membresia.estado}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progreso</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {getProgressPercent()}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressPercent()}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <Calendar className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Inicio</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatDate(membresia.fechaInicio)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <Calendar className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Fin</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatDate(membresia.fechaFin)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <Clock className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Días restantes</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {membresia.diasRestantes ?? '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
