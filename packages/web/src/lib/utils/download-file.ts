import { useAuthStore } from '@/lib/stores/auth-store';

export async function downloadFile(url: string, filename: string) {
  try {
    const token = useAuthStore.getState().getAccessToken();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        throw new Error('Sesión expirada');
      }
      throw new Error('Error descargando archivo');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error descargando archivo:', error);
    throw error;
  }
}