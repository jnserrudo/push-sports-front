import api from '../api/api';

export const authService = {
  login: async (identifier, password) => {
    const response = await api.post('/login', { identifier, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};
