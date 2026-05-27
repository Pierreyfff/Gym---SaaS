import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Dumbbell, LogIn, User, LogOut, LayoutDashboard, ShoppingBag, CreditCard, ChevronDown, ShoppingCart, Moon, Sun } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { useCartStore } from '@/lib/stores/cart-store';
import type { PublicConfiguracion } from '@gym-saas/api-client';

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [config, setConfig] = useState<PublicConfiguracion | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const totalItems = useCartStore((s) => s.totalItems);
  const setCartOpen = useCartStore((s) => s.setCartOpen);

  useEffect(() => {
    loadConfig();

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú de usuario al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#user-menu')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadConfig = async () => {
    try {
      const data = await apiClient.public.getConfiguracion();
      setConfig(data);
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const handleLogout = () => {
    clearAuth();
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  const getDashboardUrl = () => {
    if (!user) return '/login';

    switch (user.rol) {
      case 'cliente':
        return '/cliente/dashboard';
      case 'admin':
        return '/dashboard';
      case 'recepcionista':
        return '/recepcionista/dashboard';
      case 'entrenador':
        return '/entrenador/dashboard';
      default:
        return '/dashboard';
    }
  };

  const links = [
    { to: '/home', label: 'Inicio' },
    { to: '/nosotros', label: 'Nosotros' },
    { to: '/planes-publicos', label: 'Planes' },
    { to: '/tienda', label: 'Tienda' },
    { to: '/galeria-publica', label: 'Galería' },
    { to: '/contacto', label: 'Contacto' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const colorPrimario = config?.colorPrimario || '#10b981';
  const colorSecundario = config?.colorSecundario || '#3b82f6';
  const nombreGym = config?.nombreNegocio || 'GymSaaS';
  const logoUrl = config?.logoUrl;

  // Loading state
  if (!config) {
    return (
      <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="w-48 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            <div className="hidden lg:flex items-center gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-16 h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
                />
              ))}
              <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white dark:bg-gray-900 shadow-lg'
          : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-3 group">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={nombreGym}
                className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                }}
              >
                <Dumbbell className="w-7 h-7 text-white" />
              </div>
            )}
            <span
              className="text-2xl font-bold text-gray-900 dark:text-white transition-colors"
              style={scrolled ? { color: colorPrimario } : undefined}
            >
              {nombreGym}
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-semibold transition-all relative ${
                  isActive(link.to)
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: colorPrimario }}
                  />
                )}
              </Link>
            ))}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" style={{ color: colorPrimario }} />
              ) : (
                <Moon className="w-5 h-5" style={{ color: colorPrimario }} />
              )}
            </button>

            {/* Cart Icon */}
            <Link
              to="/tienda"
              onClick={() => {
                if (location.pathname === '/tienda') {
                  setCartOpen(true);
                }
              }}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" style={{ color: colorPrimario }} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* User Menu o Login Button */}
            {isAuthenticated && user ? (
              <div className="relative" id="user-menu">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: colorPrimario }}
                  >
                    {user.nombre.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{user.nombre}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user.nombre} {user.apellido}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 capitalize">
                        Rol: {user.rol}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link
                        to={getDashboardUrl()}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        <LayoutDashboard className="w-4 h-4" style={{ color: colorPrimario }} />
                        Dashboard
                      </Link>

                      {user.rol === 'cliente' && (
                        <>
                          <Link
                            to="/cliente/compras"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          >
                            <ShoppingBag className="w-4 h-4" style={{ color: colorPrimario }} />
                            Mis Compras
                          </Link>
                          <Link
                            to="/cliente/membresia"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          >
                            <CreditCard className="w-4 h-4" style={{ color: colorPrimario }} />
                            Mi Membresía
                          </Link>
                        </>
                      )}

                      <Link
                        to="/cliente/perfil"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        <User className="w-4 h-4" style={{ color: colorPrimario }} />
                        Mi Perfil
                      </Link>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white transition-all hover:scale-105 shadow-md"
                style={{ backgroundColor: colorPrimario }}
              >
                <LogIn className="w-4 h-4" />
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ color: colorPrimario }}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-semibold transition-colors px-2 py-1 ${
                    isActive(link.to)
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  style={isActive(link.to) ? { color: colorPrimario } : {}}
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated && user ? (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 px-2 mb-2">Cuenta</p>
                    <p className="font-semibold text-gray-900 dark:text-white px-2 mb-1">
                      {user.nombre} {user.apellido}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 px-2 mb-3">{user.email}</p>
                  </div>

                  {/* Dark Mode Toggle - Mobile Authenticated */}
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-2 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4" style={{ color: colorPrimario }} />
                    ) : (
                      <Moon className="w-4 h-4" style={{ color: colorPrimario }} />
                    )}
                    {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                  </button>

                  <Link
                    to={getDashboardUrl()}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-2 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                  >
                    <LayoutDashboard className="w-4 h-4" style={{ color: colorPrimario }} />
                    Dashboard
                  </Link>

                  {user.rol === 'cliente' && (
                    <>
                      <Link
                        to="/cliente/compras"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-2 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                      >
                        <ShoppingBag className="w-4 h-4" style={{ color: colorPrimario }} />
                        Mis Compras
                      </Link>
                      <Link
                        to="/cliente/membresia"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-2 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                      >
                        <CreditCard className="w-4 h-4" style={{ color: colorPrimario }} />
                        Mi Membresía
                      </Link>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-2 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  {/* Dark Mode Toggle - Mobile Unauthenticated */}
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-2 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4" style={{ color: colorPrimario }} />
                    ) : (
                      <Moon className="w-4 h-4" style={{ color: colorPrimario }} />
                    )}
                    {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                  </button>

                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all"
                    style={{ backgroundColor: colorPrimario }}
                  >
                    <LogIn className="w-4 h-4" />
                    Iniciar Sesión
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
}
