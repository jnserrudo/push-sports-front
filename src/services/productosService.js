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

    getProveedores: async () => {
        const res = await api.get('/proveedores?includeInactive=true');
        return res.data;
    },

    getAll: async () => {
        const res = await api.get('/productos?includeInactive=true');
        return res.data;
    },

    getById: async (id) => {
        const res = await api.get(`/productos/${id}`);
        return res.data;
    },

    // Busca un producto (o variante) por código de barras escaneado
    buscarPorCodigo: async (codigo) => {
        const res = await api.get(`/productos/buscar-codigo/${encodeURIComponent(codigo)}`);
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
    },

    reponerStock: async (id, data) => {
        // data can be { cantidad: 10 } or { items: [{ id_variante, cantidad }] }
        const res = await api.post(`/productos/${id}/reponer`, data);
        return res.data;
    },

    bulkUpdatePrices: async (data) => {
        // data: { productIds: string[], percentage: number, applyTo: 'precio_venta_sugerido' | 'precio_pushsport' | 'both' }
        const res = await api.put('/productos/bulk-update-prices', data);
        return res.data;
    }
};
