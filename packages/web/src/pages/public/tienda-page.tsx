import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layouts/public-layout';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Package,
  Heart,
  Filter,
  Search,
} from 'lucide-react';
import type { PublicConfiguracion, PublicProducto } from '@gym-saas/api-client';

type Producto = PublicProducto;

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

export function TiendaPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [config, setConfig] = useState<PublicConfiguracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showCarrito, setShowCarrito] = useState(false);
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
    loadCarritoFromStorage();
    loadWishlistFromStorage();
  }, []);

  useEffect(() => {
    saveCarritoToStorage();
  }, [carrito]);

  useEffect(() => {
    saveWishlistToStorage();
  }, [wishlist]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productosData, configData] = await Promise.all([
        apiClient.public.getProductos(),
        apiClient.public.getConfiguracion(),
      ]);

      setProductos(productosData.productos);
      setConfig(configData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCarritoFromStorage = () => {
    const stored = localStorage.getItem('carrito');
    if (stored) {
      setCarrito(JSON.parse(stored));
    }
  };

  const saveCarritoToStorage = () => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  };

  const loadWishlistFromStorage = () => {
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      setWishlist(JSON.parse(stored));
    }
  };

  const saveWishlistToStorage = () => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  };

  const toggleWishlist = (productoId: string) => {
    if (wishlist.includes(productoId)) {
      setWishlist(wishlist.filter((id) => id !== productoId));
    } else {
      setWishlist([...wishlist, productoId]);
    }
  };

  const agregarAlCarrito = (producto: Producto) => {
    const existente = carrito.find((item) => item.producto.id === producto.id);

    if (existente) {
      if (existente.cantidad < producto.stock) {
        setCarrito(
          carrito.map((item) =>
            item.producto.id === producto.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item,
          ),
        );

        toast({
          title: 'Producto actualizado',
          description: `${producto.nombre} (${existente.cantidad + 1})`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Stock maximo',
          description: 'No hay mas unidades disponibles',
        });
      }
    } else {
      setCarrito([...carrito, { producto, cantidad: 1 }]);

      toast({
        title: 'Agregado al carrito',
        description: producto.nombre,
      });
    }
  };

  const aumentarCantidad = (productoId: string) => {
    setCarrito(
      carrito.map((item) => {
        if (
          item.producto.id === productoId &&
          item.cantidad < item.producto.stock
        ) {
          return { ...item, cantidad: item.cantidad + 1 };
        }
        return item;
      }),
    );
  };

  const disminuirCantidad = (productoId: string) => {
    setCarrito(
      carrito
        .map((item) => {
          if (item.producto.id === productoId) {
            return { ...item, cantidad: item.cantidad - 1 };
          }
          return item;
        })
        .filter((item) => item.cantidad > 0),
    );
  };

  const eliminarDelCarrito = (productoId: string) => {
    setCarrito(carrito.filter((item) => item.producto.id !== productoId));

    toast({
      title: 'Producto eliminado',
      description: 'Se elimino del carrito',
    });
  };

  const vaciarCarrito = () => {
    setCarrito([]);

    toast({
      title: 'Carrito vaciado',
      description: 'Se eliminaron todos los productos',
    });
  };

  const totalCarrito = carrito.reduce(
    (sum, item) => sum + Number(item.producto.precio) * item.cantidad,
    0,
  );

  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleCheckout = () => {
    if (carrito.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Carrito vacio',
        description: 'Agrega productos antes de continuar',
      });
      return;
    }

    if (!isAuthenticated) {
      // Cerrar modal del carrito
      setShowCarrito(false);

      toast({
        title: 'Inicia sesion para continuar',
        description: 'Seras redirigido al login',
      });

      // Esperar un momento antes de redirigir para que se vea el toast
      setTimeout(() => {
        navigate('/login?returnUrl=/checkout');
      }, 800);
    } else {
      navigate('/checkout');
    }
  };

  // Filtrado
  const categorias = Array.from(
    new Set(productos.map((p) => p.categoria?.nombre).filter(Boolean)),
  );

  const productosFiltrados = productos.filter((p) => {
    const matchCategoria =
      categoriaFilter === 'all' || p.categoria?.nombre === categoriaFilter;
    const matchSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategoria && matchSearch;
  });

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gray-600">
            Cargando productos...
          </div>
        </div>
      </PublicLayout>
    );
  }

  const colorPrimario = config?.colorPrimario || '#9333ea';
  const colorSecundario = config?.colorSecundario || '#ec4899';

  return (
    <PublicLayout>
      {/* Hero */}
      <section
        className="py-24 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colorPrimario} 0%, ${colorSecundario} 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl font-bold mb-6">Tienda Online</h1>
          <p className="text-2xl max-w-3xl mx-auto">
            Productos de calidad para tu entrenamiento
          </p>
        </div>
      </section>

      {/* Productos */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header con filtros y carrito */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Busqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent w-full sm:w-64"
                  style={
                    { '--tw-ring-color': colorPrimario } as React.CSSProperties
                  }
                />
              </div>

              {/* Filtro por categoria */}
              {categorias.length > 0 && (
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={categoriaFilter}
                    onChange={(e) => setCategoriaFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent appearance-none cursor-pointer"
                    style={
                      {
                        '--tw-ring-color': colorPrimario,
                      } as React.CSSProperties
                    }
                  >
                    <option value="all">Todas las categorias</option>
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (wishlist.length === 0) {
                    toast({
                      title: 'Lista vacia',
                      description: 'No tienes productos favoritos',
                    });
                  } else {
                    toast({
                      title: 'Favoritos',
                      description: `Tienes ${wishlist.length} productos favoritos`,
                    });
                  }
                }}
                className="relative px-6 py-2.5 border-2 rounded-lg font-semibold transition hover:scale-105"
                style={{
                  borderColor: colorPrimario,
                  color: colorPrimario,
                }}
              >
                <Heart className="w-5 h-5 inline mr-2" />
                Favoritos
                {wishlist.length > 0 && (
                  <span
                    className="absolute -top-2 -right-2 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                    style={{ backgroundColor: colorSecundario }}
                  >
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowCarrito(true)}
                className="relative text-white px-6 py-2.5 rounded-lg font-semibold transition hover:scale-105 flex items-center gap-2 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                }}
              >
                <ShoppingCart className="w-5 h-5" />
                Carrito
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Grid de productos */}
          {productosFiltrados.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2 text-xl">
                {searchTerm || categoriaFilter !== 'all'
                  ? 'No se encontraron productos con esos filtros'
                  : 'No hay productos disponibles'}
              </p>
              <p className="text-sm text-gray-500">
                {searchTerm || categoriaFilter !== 'all'
                  ? 'Intenta con otros terminos de busqueda'
                  : 'Pronto habra nuevos productos'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productosFiltrados.map((producto, index) => (
                <div
                  key={producto.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Imagen */}
                  <div className="relative aspect-square bg-gray-200 overflow-hidden">
                    <img
                      src={
                        producto.imagenUrl ||
                        'https://via.placeholder.com/400?text=Sin+Imagen'
                      }
                      alt={producto.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://via.placeholder.com/400?text=Sin+Imagen';
                      }}
                    />

                    {/* Boton wishlist */}
                    <button
                      onClick={() => toggleWishlist(producto.id)}
                      className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          wishlist.includes(producto.id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400'
                        }`}
                      />
                    </button>

                    {/* Badge stock bajo */}
                    {producto.stock <= 5 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Ultimas unidades
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    {producto.categoria && (
                      <span
                        className="text-xs font-bold uppercase px-2 py-1 rounded"
                        style={{
                          backgroundColor: `${colorPrimario}20`,
                          color: colorPrimario,
                        }}
                      >
                        {producto.categoria.nombre}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mt-2 line-clamp-2">
                      {producto.nombre}
                    </h3>
                    {producto.descripcion && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {producto.descripcion}
                      </p>
                    )}
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <span
                          className="text-3xl font-bold"
                          style={{ color: colorPrimario }}
                        >
                          {formatPrice(Number(producto.precio))}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Stock: {producto.stock} unidades
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => agregarAlCarrito(producto)}
                      className="mt-4 w-full text-white py-3 rounded-lg font-bold transition-all hover:scale-105 shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                      }}
                    >
                      Agregar al Carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal Carrito */}
      {showCarrito && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-end animate-fade-in">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in-right">
            {/* Header */}
            <div
              className="text-white p-6 flex justify-between items-center"
              style={{
                background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
              }}
            >
              <h3 className="text-2xl font-bold">Tu Carrito</h3>
              <button
                onClick={() => setShowCarrito(false)}
                className="text-white hover:text-gray-200 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {carrito.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Tu carrito esta vacio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {carrito.map((item) => (
                    <div
                      key={item.producto.id}
                      className="flex gap-4 bg-gray-50 rounded-xl p-4 hover:shadow-md transition"
                    >
                      <img
                        src={
                          item.producto.imagenUrl ||
                          'https://via.placeholder.com/100'
                        }
                        alt={item.producto.nombre}
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://via.placeholder.com/100';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 line-clamp-1">
                          {item.producto.nombre}
                        </h4>
                        <p
                          className="text-sm font-bold mt-1"
                          style={{ color: colorPrimario }}
                        >
                          {formatPrice(Number(item.producto.precio))}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => disminuirCantidad(item.producto.id)}
                            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-lg">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => aumentarCantidad(item.producto.id)}
                            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => eliminarDelCarrito(item.producto.id)}
                            className="ml-auto text-red-600 hover:text-red-800 transition"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {carrito.length > 0 && (
              <div className="border-t-2 p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold text-gray-900">
                    Total:
                  </span>
                  <span
                    className="text-3xl font-bold"
                    style={{ color: colorPrimario }}
                  >
                    {formatPrice(totalCarrito)}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg mb-3"
                  style={{
                    background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                  }}
                >
                  Proceder al Pago
                </button>
                <button
                  onClick={vaciarCarrito}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition"
                >
                  Vaciar Carrito
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
          animation-fill-mode: both;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </PublicLayout>
  );
}
