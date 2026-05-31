import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layouts/public-layout';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useCartStore, type ProductoItem } from '@/lib/stores/cart-store';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Package,
  Heart,
  Filter,
  Search,
  Trash2,
  HeartOff,
} from 'lucide-react';
import type { PublicConfiguracion, PublicProducto } from '@gym-saas/api-client';

type Producto = PublicProducto;

export function TiendaPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const {
    items,
    wishlist,
    isCartOpen,
    isWishlistOpen,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleWishlist,
    isInWishlist,
    setCartOpen,
    setWishlistOpen,
  } = useCartStore();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [config, setConfig] = useState<PublicConfiguracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

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

  const toProductoItem = (p: Producto): ProductoItem => ({
    id: p.id,
    nombre: p.nombre,
    precio: Number(p.precio),
    imagenUrl: p.imagenUrl,
    stock: p.stock,
    categoriaNombre: p.categoria?.nombre,
  });

  const handleAddToCart = (producto: Producto) => {
    const existing = items.find((i) => i.producto.id === producto.id);
    if (existing && existing.cantidad >= producto.stock) {
      toast({
        variant: 'destructive',
        title: 'Stock maximo',
        description: 'No hay mas unidades disponibles',
      });
      return;
    }
    addToCart(toProductoItem(producto));
    toast({
      title: 'Agregado al carrito',
      description: producto.nombre,
    });
  };

  const handleAumentarCantidad = (productoId: string) => {
    const item = items.find((i) => i.producto.id === productoId);
    const prod = productos.find((p) => p.id === productoId);
    if (item && prod && item.cantidad >= prod.stock) {
      toast({
        variant: 'destructive',
        title: 'Stock maximo',
        description: 'No hay mas unidades disponibles',
      });
      return;
    }
    updateQuantity(productoId, (item?.cantidad ?? 0) + 1);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Carrito vacio',
        description: 'Agrega productos antes de continuar',
      });
      return;
    }
    if (!isAuthenticated) {
      setCartOpen(false);
      toast({
        title: 'Inicia sesión para continuar',
        description: 'Serás redirigido al login',
      });
      setTimeout(() => {
        navigate('/login?returnUrl=/checkout');
      }, 800);
    } else {
      navigate('/checkout');
    }
  };

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
          <div className="animate-pulse text-gray-600 dark:text-gray-400">
            Cargando productos...
          </div>
        </div>
      </PublicLayout>
    );
  }

  const colorPrimario = config?.colorPrimario || '#9333ea';
  const colorSecundario = config?.colorSecundario || '#ec4899';

  const wishlistProductos = productos.filter((p) => wishlist.includes(p.id));

  return (
    <PublicLayout>
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

      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:border-transparent w-full sm:w-64"
                  style={
                    { '--tw-ring-color': colorPrimario } as React.CSSProperties
                  }
                />
              </div>

              {categorias.length > 0 && (
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <select
                    value={categoriaFilter}
                    onChange={(e) => setCategoriaFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:border-transparent appearance-none cursor-pointer"
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

            <div className="flex gap-3">
              {/* Wishlist Sheet */}
              <Sheet
                open={isWishlistOpen}
                onOpenChange={setWishlistOpen}
              >
                <SheetTrigger asChild>
                  <button
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
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-md p-0">
                  <SheetHeader
                    className="text-white p-6"
                    style={{
                      background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                    }}
                  >
                    <SheetTitle className="text-2xl font-bold text-white">
                      Tus Favoritos
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-6">
                    {wishlistProductos.length === 0 ? (
                      <div className="text-center py-12">
                        <HeartOff className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                          No tienes favoritos
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {wishlistProductos.map((producto) => (
                          <div
                            key={producto.id}
                            className="flex gap-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 hover:shadow-md transition"
                          >
                            <img
                              src={
                                producto.imagenUrl ||
                                'https://via.placeholder.com/100'
                              }
                              alt={producto.nombre}
                              className="w-24 h-24 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.src =
                                  'https://via.placeholder.com/100';
                              }}
                            />
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                                {producto.nombre}
                              </h4>
                              <p
                                className="text-sm font-bold mt-1"
                                style={{ color: colorPrimario }}
                              >
                                {formatCurrency(Number(producto.precio))}
                              </p>
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    handleAddToCart(producto);
                                    setWishlistOpen(false);
                                  }}
                                  style={{
                                    background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                                  }}
                                  className="text-white flex-1"
                                >
                                  <ShoppingCart className="w-4 h-4 mr-1" />
                                  Agregar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleWishlist(producto.id)}
                                  className="text-red-500 border-red-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Cart Sheet */}
              <Sheet
                open={isCartOpen}
                onOpenChange={setCartOpen}
              >
                <SheetTrigger asChild>
                  <button
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
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-md p-0">
                  <SheetHeader
                    className="text-white p-6"
                    style={{
                      background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                    }}
                  >
                    <SheetTitle className="text-2xl font-bold text-white">
                      Tu Carrito
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto p-6">
                    {items.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingCart className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                          Tu carrito esta vacio
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div
                            key={item.producto.id}
                            className="flex gap-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 hover:shadow-md transition"
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
                              <h4 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                                {item.producto.nombre}
                              </h4>
                              <p
                                className="text-sm font-bold mt-1"
                                style={{ color: colorPrimario }}
                              >
                                {formatCurrency(Number(item.producto.precio))}
                              </p>
                              <div className="flex items-center gap-3 mt-3">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.producto.id,
                                      item.cantidad - 1,
                                    )
                                  }
                                  className="w-8 h-8 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 rounded-lg flex items-center justify-center transition"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-bold text-lg">
                                  {item.cantidad}
                                </span>
                                <button
                                  onClick={() =>
                                    handleAumentarCantidad(item.producto.id)
                                  }
                                  className="w-8 h-8 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 rounded-lg flex items-center justify-center transition"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    removeFromCart(item.producto.id)
                                  }
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

                  {items.length > 0 && (
                    <div className="border-t-2 p-6 bg-gray-50 dark:bg-gray-900">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          Total:
                        </span>
                        <span
                          className="text-3xl font-bold"
                          style={{ color: colorPrimario }}
                        >
                          {formatCurrency(totalPrice)}
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
                        onClick={clearCart}
                        className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold transition"
                      >
                        Vaciar Carrito
                      </button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {productosFiltrados.length === 0 ? (
            <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg p-12 text-center">
              <Package className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium mb-2 text-xl">
                {searchTerm || categoriaFilter !== 'all'
                  ? 'No se encontraron productos con esos filtros'
                  : 'No hay productos disponibles'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
                  className="bg-white dark:bg-gray-950 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative aspect-square bg-gray-200 dark:bg-gray-700 overflow-hidden">
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
                    <button
                      onClick={() => toggleWishlist(producto.id)}
                      className="absolute top-3 right-3 w-10 h-10 bg-white dark:bg-gray-950 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isInWishlist(producto.id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                      />
                    </button>
                    {producto.stock <= 5 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Ultimas unidades
                      </div>
                    )}
                  </div>
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
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-2 line-clamp-2">
                      {producto.nombre}
                    </h3>
                    {producto.descripcion && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                        {producto.descripcion}
                      </p>
                    )}
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <span
                          className="text-3xl font-bold"
                          style={{ color: colorPrimario }}
                        >
                          {formatCurrency(Number(producto.precio))}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Stock: {producto.stock} unidades
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToCart(producto)}
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

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </PublicLayout>
  );
}
