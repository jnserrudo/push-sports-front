import api from '../api/api';

export const sucursalesService = {
    getAll: async () => {
        const response = await api.get('/comercios');
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/comercios/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/comercios', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/comercios/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/comercios/${id}`);
        return response.data;
    },
    getTiposComercio: async () => {
        const response = await api.get('/catalogos/tipos-comercio');
        return response.data;
    }
};
