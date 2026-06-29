import api from '../api/api';

export const reportesEntregaService = {
  async getAll(params = {}) {
    const response = await api.get('/reportes-entrega', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/reportes-entrega/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/reportes-entrega', data);
    return response.data;
  }
};
