import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: ('admin' | 'recepcionista' | 'entrenador' | 'cliente')[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifican roles requeridos, verificar
  if (requiredRoles && user && !requiredRoles.includes(user.rol)) {
    // Redirigir según el rol del usuario a SU dashboard correspondiente
    switch (user.rol) {
      case 'cliente':
        return <Navigate to="/cliente/dashboard" replace />;
      case 'recepcionista':
        return <Navigate to="/recepcionista/dashboard" replace />;
      case 'entrenador':
        return <Navigate to="/entrenador/dashboard" replace />;
      case 'admin':
        return <Navigate to="/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}