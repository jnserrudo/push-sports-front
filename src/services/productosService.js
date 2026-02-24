import api from '../api/api';

export const productosService = {
    getCategorias: async () => {
        const res = await api.get('/catalogos/categorias');
        return res.data;
    },
    
    getMarcas: async () => {
        const res = await api.get('/catalogos/marcas');
        return res.data;
    },

    getAll: async () => {
        const res = await api.get('/productos');
        return res.data;
    },

    create: async (data) => {
        const res = await api.post('/productos', data);
        return res.data;
    },

    update: async (id, data) => {
        const res = await api.put(`/productos/${id}`, data);
        return res.data;
    },

    delete: async (id) => {
        const res = await api.delete(`/productos/${id}`);
        return res.data;
    }
};
