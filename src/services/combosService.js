import api from '../api/api';

export const combosService = {
    getAll: async () => {
        const response = await api.get('/combos');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/combos/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/combos', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/combos/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/combos/${id}`);
        return response.data;
    }
};
