import { GymSaasApiClient } from '@gym-saas/api-client';
import { useAuthStore } from '@/lib/stores/auth-store';

// Crear instancia del API client
export const apiClient = new GymSaasApiClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  getAccessToken: () => {
    return useAuthStore.getState().getAccessToken();
  },
  
  getRefreshToken: () => {
    return useAuthStore.getState().getRefreshToken();
  },
  
  setTokens: (accessToken: string,_refreshToken: string) => { // quitarle el _ si es necesario en futuro p
    useAuthStore.getState().setAccessToken(accessToken);
    // El refresh token no cambia, solo el access
  },
  
  onTokenExpired: () => {
    // Limpiar auth y redirigir al login
    useAuthStore.getState().clearAuth();
    window.location.href = '/login';
  },
  
  onUnauthorized: () => {
    // Limpiar auth y redirigir al login
    useAuthStore.getState().clearAuth();
    window.location.href = '/login';
  },
});