import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/format';

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
}

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

interface ItemVenta {
  productoId: string;
  cantidad: number;
  producto?:  Producto;
}

export function NuevaVentaPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<ItemVenta[]>([{ productoId: '', cantidad: 1 }]);
  const [clienteId, setClienteId] = useState('');
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [tipoEntrega, setTipoEntrega] = useState<'retiro' | 'domicilio'>('retiro');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [nota, setNota] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productosRes, clientesRes] = await Promise.all([
        apiClient. productos.findAll(),
        apiClient.clientes.findAll(),
      ]);
      setProductos(productosRes.productos. filter((p:  any) => p.estado === 'activo' && p.stock > 0));
      setClientes(clientesRes.clientes);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive',
      });
    }
  };

  const handleAddItem = () => {
    setItems([...items, { productoId: '', cantidad: 1 }]);
  };

  const handleRemoveItem = (index:  number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productoId' | 'cantidad', value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const getProducto = (productoId: string) => {
    return productos.find((p) => p.id === productoId);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const producto = getProducto(item.productoId);
      if (! producto) return sum;
      return sum + producto.precio * item.cantidad;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    const validItems = items.filter((item) => item.productoId && item.cantidad > 0);

    if (validItems.length === 0) {
      toast({
        title: 'Items requeridos',
        description: 'Debes agregar al menos un producto',
        variant: 'destructive',
      });
      return;
    }

    // Validar stock
    for (const item of validItems) {
      const producto = getProducto(item.productoId);
      if (! producto) continue;

      if (item.cantidad > producto.stock) {
        toast({
          title:  'Stock insuficiente',
          description: `${producto.nombre} solo tiene ${producto.stock} unidades disponibles`,
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      setLoading(true);

      await apiClient.ventasProductos.create({
        items: validItems,
        clienteId: clienteId || undefined,
        metodoPago,
        tipoEntrega,
        telefono,
        direccion: direccion || undefined,
        ciudad: ciudad || undefined,
        codigoPostal: codigoPostal || undefined,
        nota: nota || undefined,
      });

      toast({
        title: 'Venta registrada',
        description: 'La venta ha sido registrada correctamente',
      });

      navigate('/ventas-productos');
    } catch (error:  any) {
      console.error('Error registrando venta:', error);
      const message = error.response?.data?.message || 'Error al registrar la venta';

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-950 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/ventas-productos')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nueva Venta</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user?.nombre} {user?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg: px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Items de venta */}
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Productos</h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                <Plus className="w-5 h-5" />
                Agregar producto
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => {
                const producto = getProducto(item.productoId);
                const subtotal = producto ? producto.precio * item.cantidad : 0;

                return (
                  <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Producto
                        </label>
                        <select
                          value={item.productoId}
                          onChange={(e) => handleItemChange(index, 'productoId', e.target.value)}
                          required
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Seleccionar producto</option>
                          {productos.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombre} - {formatCurrency(p.precio)} (Stock: {p.stock})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Cantidad
                        </label>
                        <input
                          type="number"
                          value={item.cantidad}
                          onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value) || 1)}
                          required
                          min="1"
                          max={producto?. stock || 999}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        className="text-red-600 hover:text-red-800 transition disabled:opacity-30"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      {producto && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Subtotal</p>
                          <p className="text-lg font-bold text-purple-600">{formatCurrency(subtotal)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detalles de venta */}
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Detalles de la Venta</h2>

            <div>
              <label htmlFor="clienteId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cliente (Opcional)
              </label>
              <select
                id="clienteId"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Venta directa (sin cliente)</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.apellido} - {c.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tipo de Entrega
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'retiro', label: 'Retiro en local' },
                  { value: 'domicilio', label: 'Delivery' },
                ].map((tipo) => (
                  <button
                    key={tipo.value}
                    type="button"
                    onClick={() => setTipoEntrega(tipo.value as 'retiro' | 'domicilio')}
                    className={`p-4 border-2 rounded-lg transition text-center ${
                      tipoEntrega === tipo.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{tipo.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {tipoEntrega === 'domicilio' && (
              <>
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    id="telefono"
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="999 999 999"
                  />
                </div>
                <div>
                  <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dirección
                  </label>
                  <input
                    id="direccion"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Calle y número"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ciudad
                    </label>
                    <input
                      id="ciudad"
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ciudad"
                    />
                  </div>
                  <div>
                    <label htmlFor="codigoPostal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Código Postal
                    </label>
                    <input
                      id="codigoPostal"
                      value={codigoPostal}
                      onChange={(e) => setCodigoPostal(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="12345"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Método de Pago
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'efectivo', label: 'Efectivo' },
                  { value: 'tarjeta', label: 'Tarjeta' },
                  { value:  'transferencia', label: 'Transferencia' },
                ].map((metodo) => (
                  <button
                    key={metodo. value}
                    type="button"
                    onClick={() => setMetodoPago(metodo.value as any)}
                    className={`p-4 border-2 rounded-lg transition text-center ${
                      metodoPago === metodo.value
                        ?  'border-purple-500 bg-purple-50'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{metodo.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="nota" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nota (Opcional)
              </label>
              <textarea
                id="nota"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Información adicional..."
              />
            </div>
          </div>

          {/* Total y botones */}
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6 pb-6 border-b">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total a pagar:</span>
              <span className="text-3xl font-bold text-purple-600">{formatCurrency(calculateTotal())}</span>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/ventas-productos')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                disabled={loading}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{loading ? 'Procesando...' : 'Registrar Venta'}</span>
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}