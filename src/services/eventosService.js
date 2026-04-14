import api from '../api/api';

export const eventosService = {
    getAll: async () => {
        const response = await api.get('/eventos');
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/eventos/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/eventos', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/eventos/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/eventos/${id}`);
        return response.data;
    },
};
