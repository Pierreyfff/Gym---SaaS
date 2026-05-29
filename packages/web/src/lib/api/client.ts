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
  
  setTokens: (accessToken: string, refreshToken: string) => {
    useAuthStore.getState().setAccessToken(accessToken);
    if (refreshToken) {
      useAuthStore.getState().setRefreshToken(refreshToken);
    }
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