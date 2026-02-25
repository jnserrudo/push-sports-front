import api from '../api/api';

export const authService = {
  login: async (identifier, password) => {
    try {
      // Usamos 'identifier' para soportar tanto email como nombre de usuario
      const response = await api.post('/login', { identifier, password });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const retry = await api.post('/auth/login', { identifier, password });
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
