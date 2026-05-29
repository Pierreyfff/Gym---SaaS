import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from '@/lib/providers/query-provider';
import { Toaster } from '@/components/shared/toaster';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { LoginPage } from '@/pages/auth/login-page';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { useAuthStore } from '@/lib/stores/auth-store';
import { UsersPage } from '@/pages/users/users-page';
import { UserFormPage } from '@/pages/users/user-form-page';
import { ClientesPage } from '@/pages/clientes/clientes-page';
import { ClienteFormPage } from '@/pages/clientes/cliente-form-page';
import { ClientePerfilPage } from '@/pages/clientes/cliente-perfil-page';
import { PlanesPage } from './pages/planes/planes-page';
import { PlanFormPage } from '@/pages/planes/plan-form-page';
import { MembresiasPage } from '@/pages/membresias/membresias-page';
import { MembresiaFormPage } from './pages/membresias/membresia-form-page';
import { PagosPage } from '@/pages/pagos/pagos-page';
import { AsistenciasPage } from '@/pages/asistencias/asistencias-page';
import { AsistenciaFormPage } from '@/pages/asistencias/asistencia-form-page';
import { WizardInscripcionPage } from '@/pages/inscripciones/wizard-inscripcion-page';
import { RenovarMembresiaPage } from '@/pages/membresias/renovar-membresia-page';
import { ConfiguracionPage } from '@/pages/configuracion/configuracion-page';
import { ProductosPage } from '@/pages/productos/productos-page';
import { ProductoFormPage } from '@/pages/productos/producto-form-page';
import { CategoriasPage } from '@/pages/productos/categorias-page';
import { VentasProductosPage } from '@/pages/productos/ventas-productos-page';
import { NuevaVentaPage } from '@/pages/productos/nueva-venta-page';
import { IngresosPage } from '@/pages/ingresos/ingresos-page';
import { StaffPage } from '@/pages/staff/staff-page';
import { StaffFormPage } from '@/pages/staff/staff-form-page';
import { HorariosPage } from '@/pages/horarios/horarios-page';
import { TestimoniosPage } from '@/pages/testimonios/testimonios-page';
import { TestimonioFormPage } from '@/pages/testimonios/testimonio-form-page';
import { GaleriaPage } from '@/pages/galeria/galeria-page';
import { GaleriaFormPage } from '@/pages/galeria/galeria-form-page';
import { HomePage } from '@/pages/public/home-page';
import { NosotrosPage } from '@/pages/public/nosotros-page';
import { PlanesPublicosPage } from '@/pages/public/planes-publicos-page';
import { GaleriaPublicaPage } from '@/pages/public/galeria-publica-page';
import { ContactoPage } from '@/pages/public/contacto-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { TiendaPage } from '@/pages/public/tienda-page';
import { RegistroPage } from '@/pages/auth/registro-page';
import { CheckoutPage } from '@/pages/public/checkout-page';
import { ClienteDashboardPage } from '@/pages/clientes/cliente-dashboard-page';
import { ClientePerfilClientePage } from '@/pages/clientes/cliente-perfil-cliente-page';
import { ClienteComprasPage } from '@/pages/clientes/cliente-compras-page';
import { ClienteMembresiaPage } from '@/pages/clientes/cliente-membresia-page';
import { RecepcionistaDashboardPage } from '@/pages/recepcionista/recepcionista-dashboard-page';
import { EntrenadorDashboardPage } from '@/pages/entrenador/entrenador-dashboard-page';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <ErrorBoundary>
      <QueryProvider>
        <BrowserRouter>
          <Routes>
            {/* Ruta raíz - redirige según autenticación y rol */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  user?.rol === 'cliente' ? (
                    <Navigate to="/cliente/dashboard" replace />
                  ) : user?.rol === 'recepcionista' ? (
                    <Navigate to="/recepcionista/dashboard" replace />
                  ) : user?.rol === 'entrenador' ? (
                    <Navigate to="/entrenador/dashboard" replace />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                ) : (
                  <Navigate to="/home" replace />
                )
              }
            />

            {/* Rutas públicas (Web Pública) */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/nosotros" element={<NosotrosPage />} />
            <Route path="/planes-publicos" element={<PlanesPublicosPage />} />
            <Route path="/galeria-publica" element={<GaleriaPublicaPage />} />
            <Route path="/tienda" element={<TiendaPage />} />
            <Route path="/contacto" element={<ContactoPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />

            {/* Dashboard Admin - SOLO ADMIN */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Dashboard Cliente */}
            <Route
              path="/cliente/dashboard"
              element={
                <ProtectedRoute requiredRoles={['cliente']}>
                  <ClienteDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cliente/perfil"
              element={
                <ProtectedRoute requiredRoles={['cliente']}>
                  <ClientePerfilClientePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cliente/compras"
              element={
                <ProtectedRoute requiredRoles={['cliente']}>
                  <ClienteComprasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cliente/membresia"
              element={
                <ProtectedRoute requiredRoles={['cliente']}>
                  <ClienteMembresiaPage />
                </ProtectedRoute>
              }
            />

            {/* Dashboard Recepcionista */}
            <Route
              path="/recepcionista/dashboard"
              element={
                <ProtectedRoute requiredRoles={['recepcionista']}>
                  <RecepcionistaDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Dashboard Entrenador */}
            <Route
              path="/entrenador/dashboard"
              element={
                <ProtectedRoute requiredRoles={['entrenador']}>
                  <EntrenadorDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Usuarios - Solo Admin */}
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios/nuevo"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <UserFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios/:id/editar"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <UserFormPage />
                </ProtectedRoute>
              }
            />

            {/* Clientes - Admin, Recepcionista y Entrenador */}
            <Route
              path="/clientes"
              element={
                <ProtectedRoute requiredRoles={['admin', 'recepcionista', 'entrenador']}>
                  <ClientesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes/nuevo"
              element={
                <ProtectedRoute requiredRoles={['admin', 'recepcionista']}>
                  <ClienteFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes/:id"
              element={
                <ProtectedRoute requiredRoles={['admin', 'recepcionista', 'entrenador']}>
                  <ClientePerfilPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes/:id/editar"
              element={
                <ProtectedRoute requiredRoles={['admin', 'recepcionista']}>
                  <ClienteFormPage />
                </ProtectedRoute>
              }
            />

            {/* Planes - Admin */}
            <Route
              path="/planes"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <PlanesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/planes/nuevo"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <PlanFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/planes/:id/editar"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <PlanFormPage />
                </ProtectedRoute>
              }
            />

            {/* Membresías - Admin y Recepcionista */}
            <Route
              path="/membresias"
              element={
                <ProtectedRoute requiredRoles={['admin', 'recepcionista']}>
                  <MembresiasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/membresias/:id/editar"
              element={
                <ProtectedRoute requiredRoles={['admin', 'recepcionista']}>
                  <MembresiaFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/membresias/:id/renovar"
              element={
                <ProtectedRoute requiredRoles={['admin', 'recepcionista']}>
                  <RenovarMembresiaPage />
                </ProtectedRoute>
              }
            />

            {/* Pagos - Admin y Recepcionista */}
            <Route
              path="/pagos"
              element={
                <ProtectedRoute requiredRoles={['admin', 'recepcionista']}>
                  <PagosPage />
                </ProtectedRoute>
              }
            />

            {/* Asistencias - Admin, Recepcionista y Entrenador */}
            <Route
              path="/asistencias"
              element={
                <ProtectedRoute requiredRoles={['admin', 'recepcionista', 'entrenador']}>
                  <AsistenciasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/asistencias/nuevo"
              element={
                <ProtectedRoute requiredRoles={['admin', 'recepcionista']}>
                  <AsistenciaFormPage />
                </ProtectedRoute>
              }
            />

            {/* Inscripciones - Admin y Recepcionista */}
            <Route
              path="/inscripciones/nueva"
              element={
                <ProtectedRoute requiredRoles={['admin', 'recepcionista']}>
                  <WizardInscripcionPage />
                </ProtectedRoute>
              }
            />

            {/* Configuración - Solo Admin */}
            <Route
              path="/configuracion"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <ConfiguracionPage />
                </ProtectedRoute>
              }
            />

            {/* Productos - Admin y Recepcionista */}
            <Route
              path="/productos"
              element={
                <ProtectedRoute requiredRoles={['admin', 'recepcionista']}>
                  <ProductosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/productos/nuevo"
              element={
                <ProtectedRoute requiredRoles={['admin', 'recepcionista']}>
                  <ProductoFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/productos/:id/editar"
              element={
                <ProtectedRoute requiredRoles={['admin', 'recepcionista']}>
                  <ProductoFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/productos/categorias"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <CategoriasPage />
                </ProtectedRoute>
              }
            />

            {/* Ventas de productos - Admin y Recepcionista */}
            <Route
              path="/ventas-productos"
              element={
                <ProtectedRoute requiredRoles={['admin', 'recepcionista']}>
                  <VentasProductosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ventas-productos/nueva"
              element={
                <ProtectedRoute requiredRoles={['admin', 'recepcionista']}>
                  <NuevaVentaPage />
                </ProtectedRoute>
              }
            />

            {/* Ingresos y Reportes - Solo Admin */}
            <Route
              path="/ingresos"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <IngresosPage />
                </ProtectedRoute>
              }
            />

            {/* Staff - Solo Admin */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <StaffPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/horarios"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <HorariosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/nuevo"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <StaffFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/:id/editar"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <StaffFormPage />
                </ProtectedRoute>
              }
            />

            {/* Testimonios - Solo Admin */}
            <Route
              path="/testimonios"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <TestimoniosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/testimonios/nuevo"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <TestimonioFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/testimonios/:id/editar"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <TestimonioFormPage />
                </ProtectedRoute>
              }
            />

            {/* Galería - Solo Admin */}
            <Route
              path="/galeria"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <GaleriaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/galeria/nueva"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <GaleriaFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/galeria/:id/editar"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <GaleriaFormPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all - 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;