import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  onTokenExpired?: () => void;
  onUnauthorized?: () => void;
  getAccessToken?: () => string | null;
  getRefreshToken?: () => string | null;
  setTokens?: (accessToken: string, refreshToken: string) => void;
}

export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });

  // Request interceptor - Agregar token automáticamente
  client.interceptors.request.use(
    (requestConfig:  InternalAxiosRequestConfig) => {
      const token = config.getAccessToken?.();
      
      if (token && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
      
      return requestConfig;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor - Manejar errores y refresh token
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Si es 401 y no hemos intentado refrescar
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = config.getRefreshToken?.();

        if (refreshToken) {
          try {
            // Intentar refrescar el token
            const response = await axios.post(`${config.baseURL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            if (config.setTokens) {
              config.setTokens(accessToken, newRefreshToken || refreshToken);
            }

            // Reintentar request original con nuevo token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return client(originalRequest);
          } catch (refreshError) {
            // Si el refresh falla, ejecutar callback
            config.onTokenExpired?.();
            return Promise.reject(refreshError);
          }
        } else {
          // No hay refresh token, ejecutar callback
          config.onUnauthorized?.();
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
}