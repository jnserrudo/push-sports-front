import api from '../api/api';

export const authService = {
  login: async (email, password) => {
    try {
      // Intentamos con /login si /auth/login da 404, pero por ahora mantenemos el estándar
      // que el usuario reporte si su ruta es /login o /users/login
      const response = await api.post('/login', { email, password });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Fallback or retry with /auth/login if both are common
        const retry = await api.post('/auth/login', { email, password });
        return retry.data;
      }
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const retry = await api.post('/auth/register', userData);
        return retry.data;
      }
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};
