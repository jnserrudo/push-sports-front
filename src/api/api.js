import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://push-sports-back.onrender.com/api',
});

// Interceptor to add the token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      // No redirigir si el usuario está en una ruta pública (B2C o landing de evento)
      const currentHash = window.location.hash || '';
      const isPublicRoute = currentHash.startsWith('#/shop') ||
                            currentHash.startsWith('#/unsubscribe') ||
                            currentHash.startsWith('#/e/');

      // No redirigir si es un error de validación en login o cambio de password
      const isValidationEndpoint = error.config.url.includes('/auth/login') || 
                                   error.config.url.includes('/usuarios/cambiar-password');

      if (!isPublicRoute && !isValidationEndpoint) {
        useAuthStore.getState().logout();
        window.location.replace('/#/login?expired=true');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
