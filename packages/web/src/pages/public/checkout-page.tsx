import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layouts/public-layout';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useCartStore } from '@/lib/stores/cart-store';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api/client';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, MapPin, CreditCard, CheckCircle, ArrowLeft, ArrowRight, Truck, Store } from 'lucide-react';

type PasoCheckout = 1 | 2 | 3 | 4;

export function CheckoutPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const { items, clearCart } = useCartStore();
  
  const [paso, setPaso] = useState<PasoCheckout>(1);
  const [procesando, setProcesando] = useState(false);
  const [costoEnvio, setCostoEnvio] = useState(0);
  
  // Datos de envio
  const [datosEnvio, setDatosEnvio] = useState({
    tipoEntrega: 'retiro' as 'retiro' | 'domicilio',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    telefono: '',
    notas: '',
  });

  // Datos de pago
  const [datosPago, setDatosPago] = useState({
    metodoPago: 'efectivo',
  });

  useEffect(() => {
    apiClient.public.getConfiguracion().then((config) => {
      setCostoEnvio(Number(config.costoEnvio) || 0);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        variant: 'destructive',
        title: 'Acceso denegado',
        description: 'Debes iniciar sesion para acceder al checkout',
      });
      navigate('/login?returnUrl=/checkout');
      return;
    }

    if (items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Carrito vacio',
        description: 'No hay productos en el carrito',
      });
      navigate('/tienda');
      return;
    }
  }, [isAuthenticated, navigate, toast, items.length]);

  const totalProductos = useCartStore((s) => s.totalPrice);
  const totalCarrito = datosEnvio.tipoEntrega === 'domicilio'
    ? totalProductos + costoEnvio
    : totalProductos;

  const handleSiguientePaso = () => {
    if (paso === 1) {
      setPaso(2);
    } else if (paso === 2) {
      if (datosEnvio.tipoEntrega === 'domicilio') {
        if (!datosEnvio.direccion || !datosEnvio.ciudad || !datosEnvio.telefono) {
          toast({
            variant: 'destructive',
            title: 'Datos incompletos',
            description: 'Completa todos los campos de envio',
          });
          return;
        }
      } else {
        if (!datosEnvio.telefono) {
          toast({
            variant: 'destructive',
            title: 'Telefono requerido',
            description: 'Ingresa un telefono de contacto',
          });
          return;
        }
      }
      setPaso(3);
    } else if (paso === 3) {
      handleFinalizarCompra();
    }
  };

  const handleFinalizarCompra = async () => {
    setProcesando(true);

    try {
      await apiClient.ventasProductos.create({
        items: items.map(item => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
        })),
        metodoPago: datosPago.metodoPago,
        tipoEntrega: datosEnvio.tipoEntrega,
        direccion: datosEnvio.direccion || undefined,
        ciudad: datosEnvio.ciudad || undefined,
        codigoPostal: datosEnvio.codigoPostal || undefined,
        telefono: datosEnvio.telefono,
        nota: datosEnvio.notas || undefined,
      });

      clearCart();
      
      setPaso(4);
      
      toast({
        title: 'Compra exitosa',
        description: 'Tu pedido ha sido registrado correctamente',
      });
    } catch (error: any) {
      console.error('Error al finalizar compra:', error);
      toast({
        variant: 'destructive',
        title: 'Error al procesar',
        description: error.response?.data?.message || 'Ocurrio un error al finalizar la compra',
      });
    } finally {
      setProcesando(false);
    }
  };

  const renderPaso = () => {
    switch (paso) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Paso 1: Revisar Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.producto.id} className="flex gap-4 bg-gray-50 rounded-lg p-4">
                    <img
                      src={item.producto.imagenUrl || 'https://via.placeholder.com/100'}
                      alt={item.producto.nombre}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        e.currentTarget.src = 'https://via.placeholder.com/100';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{item.producto.nombre}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Cantidad: {item.cantidad}
                      </p>
                      <p className="text-sm font-bold text-purple-600 mt-1">
                        {formatCurrency(Number(item.producto.precio))} x {item.cantidad} ={' '}
                        {formatCurrency(Number(item.producto.precio) * item.cantidad)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Paso 2: Datos de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipo de entrega */}
              <div className="space-y-2">
                <Label>Tipo de Entrega</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setDatosEnvio({ ...datosEnvio, tipoEntrega: 'retiro' })}
                    className={`p-4 border-2 rounded-lg font-semibold transition text-left ${
                      datosEnvio.tipoEntrega === 'retiro'
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Store className="w-5 h-5" />
                      Retiro en gimnasio
                    </div>
                    <p className="text-xs font-normal opacity-75">Sin costo adicional</p>
                  </button>
                  <button
                    onClick={() => setDatosEnvio({ ...datosEnvio, tipoEntrega: 'domicilio' })}
                    className={`p-4 border-2 rounded-lg font-semibold transition text-left ${
                      datosEnvio.tipoEntrega === 'domicilio'
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-5 h-5" />
                      Envio a domicilio
                    </div>
                    <p className="text-xs font-normal opacity-75">
                      + {formatCurrency(costoEnvio)} de envio
                    </p>
                  </button>
                </div>
              </div>

              {datosEnvio.tipoEntrega === 'domicilio' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Direccion</Label>
                    <Input
                      id="direccion"
                      value={datosEnvio.direccion}
                      onChange={(e) => setDatosEnvio({ ...datosEnvio, direccion: e.target.value })}
                      placeholder="Calle y numero"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ciudad">Ciudad</Label>
                      <Input
                        id="ciudad"
                        value={datosEnvio.ciudad}
                        onChange={(e) => setDatosEnvio({ ...datosEnvio, ciudad: e.target.value })}
                        placeholder="Ciudad"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="codigoPostal">Codigo Postal</Label>
                      <Input
                        id="codigoPostal"
                        value={datosEnvio.codigoPostal}
                        onChange={(e) => setDatosEnvio({ ...datosEnvio, codigoPostal: e.target.value })}
                        placeholder="12345"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="telefono">Telefono de contacto</Label>
                <Input
                  id="telefono"
                  value={datosEnvio.telefono}
                  onChange={(e) => setDatosEnvio({ ...datosEnvio, telefono: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas">Notas adicionales (opcional)</Label>
                <Textarea
                  id="notas"
                  value={datosEnvio.notas}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDatosEnvio({ ...datosEnvio, notas: e.target.value })}
                  placeholder="Instrucciones especiales para la entrega"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Paso 3: Metodo de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Selecciona un metodo de pago</Label>
                <div className="space-y-3">
                  <button
                    onClick={() => setDatosPago({ metodoPago: 'efectivo' })}
                    className={`w-full p-4 border-2 rounded-lg font-semibold text-left transition ${
                      datosPago.metodoPago === 'efectivo'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        datosPago.metodoPago === 'efectivo' ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                      }`}>
                        {datosPago.metodoPago === 'efectivo' && (
                          <CheckCircle className="w-full h-full text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold">Pago en Efectivo</p>
                        <p className="text-sm text-gray-600">Paga al recibir el producto</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setDatosPago({ metodoPago: 'tarjeta' })}
                    className={`w-full p-4 border-2 rounded-lg font-semibold text-left transition ${
                      datosPago.metodoPago === 'tarjeta'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        datosPago.metodoPago === 'tarjeta' ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                      }`}>
                        {datosPago.metodoPago === 'tarjeta' && (
                          <CheckCircle className="w-full h-full text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold">Tarjeta de Credito/Debito</p>
                        <p className="text-sm text-gray-600">Stripe (Proximamente)</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setDatosPago({ metodoPago: 'transferencia' })}
                    className={`w-full p-4 border-2 rounded-lg font-semibold text-left transition ${
                      datosPago.metodoPago === 'transferencia'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        datosPago.metodoPago === 'transferencia' ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                      }`}>
                        {datosPago.metodoPago === 'transferencia' && (
                          <CheckCircle className="w-full h-full text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold">Transferencia Bancaria</p>
                        <p className="text-sm text-gray-600">Mercado Pago (Proximamente)</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {datosPago.metodoPago !== 'efectivo' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Esta integracion estara disponible proximamente. Por ahora, selecciona pago en efectivo.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="text-center">
            <CardContent className="pt-12 pb-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Compra Exitosa</h2>
              <p className="text-gray-600 mb-8">
                Tu pedido ha sido registrado correctamente. Nos pondremos en contacto contigo pronto.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/cliente/compras')}
                  className="w-full max-w-xs"
                >
                  Ver mis Compras
                </Button>
                <Button
                  onClick={() => navigate('/tienda')}
                  variant="outline"
                  className="w-full max-w-xs"
                >
                  Volver a la Tienda
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  // Pantalla de carga mientras redirige al login
  if (!isAuthenticated) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirigiendo al inicio de sesion...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Pantalla de carrito vacio
  if (items.length === 0) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito esta vacio</h2>
            <p className="text-gray-600 mb-6">Agrega productos desde la tienda</p>
            <Button onClick={() => navigate('/tienda')}>
              Ir a la Tienda
            </Button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-600">Usuario: {user?.nombre} {user?.apellido}</p>
          </div>

          {/* Progress Bar */}
          {paso !== 4 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                {[1, 2, 3].map((numPaso) => (
                  <div key={numPaso} className="flex-1 flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        paso >= numPaso
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {numPaso}
                    </div>
                    {numPaso < 3 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          paso > numPaso ? 'bg-purple-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Productos</span>
                <span>Entrega</span>
                <span>Pago</span>
              </div>
            </div>
          )}

          {/* Contenido del paso */}
          <div className="mb-8">
            {renderPaso()}
          </div>

          {/* Resumen y Botones */}
          {paso !== 4 && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal productos</span>
                    <span>{formatCurrency(totalProductos)}</span>
                  </div>
                  {datosEnvio.tipoEntrega === 'domicilio' && costoEnvio > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Costo de envio</span>
                      <span>{formatCurrency(costoEnvio)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">Total:</span>
                    <span className="text-3xl font-bold text-purple-600">
                      {formatCurrency(totalCarrito)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  {paso > 1 && (
                    <Button
                      onClick={() => setPaso((paso - 1) as PasoCheckout)}
                      variant="outline"
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Anterior
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleSiguientePaso}
                    disabled={procesando}
                    className="flex-1"
                  >
                    {procesando ? (
                      'Procesando...'
                    ) : paso === 3 ? (
                      'Finalizar Compra'
                    ) : (
                      <>
                        Siguiente
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}