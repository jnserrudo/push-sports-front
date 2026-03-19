import api from '../api/api';

export const tipoComercioService = {
    getAll: async () => {
        const response = await api.get('/tipos-comercio');
        return response.data;
    },
    
    getById: async (id) => {
        const response = await api.get(`/tipos-comercio/${id}`);
        return response.data;
    },
    
    create: async (data) => {
        const response = await api.post('/tipos-comercio', data);
        return response.data;
    },
    
    update: async (id, data) => {
        const response = await api.put(`/tipos-comercio/${id}`, data);
        return response.data;
    },
    
    delete: async (id) => {
        const response = await api.delete(`/tipos-comercio/${id}`);
        return response.data;
    }
};
