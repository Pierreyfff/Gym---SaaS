import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layouts/public-layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/client';
import { formatCurrency } from '@/lib/format';
import { ShoppingBag, Package, Calendar, ArrowLeft, Store, Truck, MapPin } from 'lucide-react';
import type { VentaProductoResponseDto } from '@gym-saas/shared';

const estadoEnvioLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  preparando: 'Preparando',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const estadoEnvioColors: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  preparando: 'bg-blue-100 text-blue-800',
  enviado: 'bg-purple-100 text-purple-800',
  entregado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
};

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
      const data = await apiClient.ventasProductos.findAll(user!.id);
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
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse ml-auto" />
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const metodoPagoLabel: Record<string, string> = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
              <Link
                to="/cliente/dashboard"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition"
              >
              <ArrowLeft className="w-4 h-4" />
              Volver al panel
            </Link>
          </div>

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
                  <p className="text-gray-600 text-lg mb-2">
                    Aún no tienes compras
                  </p>
                  <p className="text-gray-400 text-sm mb-6">
                    Todavía no has realizado ninguna compra en la tienda del gimnasio
                  </p>
                  <Link to="/tienda">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Store className="w-4 h-4 mr-2" />
                      Ir a la Tienda
                    </Button>
                  </Link>
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
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {compra.producto.nombre}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(compra.fechaVenta)}
                            </span>
                            <Badge variant="secondary" className="capitalize">
                              {metodoPagoLabel[compra.metodoPago] || compra.metodoPago}
                            </Badge>
                            {compra.tipoEntrega && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                {compra.tipoEntrega === 'domicilio' ? (
                                  <Truck className="w-3 h-3" />
                                ) : (
                                  <MapPin className="w-3 h-3" />
                                )}
                                {compra.tipoEntrega === 'domicilio' ? 'Domicilio' : 'Retiro'}
                              </Badge>
                            )}
                            {compra.estadoEnvio && (
                              <Badge className={estadoEnvioColors[compra.estadoEnvio]}>
                                {estadoEnvioLabels[compra.estadoEnvio]}
                              </Badge>
                            )}
                          </div>
                          {compra.tipoEntrega === 'domicilio' && compra.direccion && (
                            <p className="text-xs text-gray-400 mt-1">
                              {compra.direccion}{compra.ciudad ? `, ${compra.ciudad}` : ''}
                            </p>
                          )}
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
