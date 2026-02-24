import api from '../api/api';

export const sucursalesService = {
    getAll: async () => {
        const response = await api.get('/sucursales');
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/sucursales', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/sucursales/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/sucursales/${id}`);
        return response.data;
    }
};
