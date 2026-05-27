import { useState, useEffect } from 'react';
import { PublicLayout } from '@/components/layouts/public-layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/client';
import { formatCurrency } from '@/lib/format';
import { ShoppingBag, Package, Calendar, CreditCard } from 'lucide-react';
import type { VentaProductoResponseDto } from '@gym-saas/shared';

export function ClienteComprasPage() {
  const { user } = useAuthStore();
  const [compras, setCompras] = useState<VentaProductoResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCompras();
    }
  }, [user]);

  const loadCompras = async () => {
    try {
      setLoading(true);
      const data = await apiClient.ventasProductos.findAll();
      setCompras(data.ventas);
    } catch {
      setCompras([]);
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

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-pulse text-gray-600">Cargando compras...</div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-purple-600" />
                <CardTitle className="text-2xl">Mis Compras</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {compras.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">
                    No tienes compras registradas
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {compras.map((compra) => (
                    <div
                      key={compra.id}
                      className="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {compra.producto.nombre}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(compra.fechaVenta)}
                            </span>
                            <span className="flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              {compra.metodoPago}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600">
                          {formatCurrency(compra.total)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {compra.cantidad} x {formatCurrency(compra.precioUnitario)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
