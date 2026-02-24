import api from '../api/api';

export const inventarioService = {
    // ABM principal de inventarios
    getAll: async () => {
        const response = await api.get('/inventarios');
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/inventarios/${id}`);
        return response.data;
    },
    getBySucursal: async (sucursalId) => {
        const response = await api.get(`/inventarios/sucursal/${sucursalId}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/inventarios', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/inventarios/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/inventarios/${id}`);
        return response.data;
    }
};
