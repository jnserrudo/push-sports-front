import api from '../api/api';

export const inventarioService = {
    // El backend NO tiene GET /inventarios genérico.
    // Solo tiene GET /inventarios/:id_comercio
    // Para "getAll" de SUPER_ADMIN, obtenemos comercios y luego el inventario de cada uno.
    getAll: async () => {
        try {
            const response = await api.get('/inventarios');
            return response.data;
        } catch (err) {
            console.error('Error en getAll inventarios:', err);
            return [];
        }
    },
    getById: async (id) => {
        const response = await api.get(`/inventarios/${id}`);
        return response.data;
    },
    getBySucursal: async (sucursalId) => {
        const response = await api.get(`/inventarios/${sucursalId}`);
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
    },

    // ═══════════════════════════════════════════════════════════
    // MÉTODOS PARA VARIANTES
    // ═══════════════════════════════════════════════════════════

    // Obtener stock de una variante específica en un comercio
    getStockVariante: async (id_comercio, id_variante) => {
        const response = await api.get(`/inventarios/${id_comercio}/variantes/${id_variante}`);
        return response.data;
    },

    // Actualizar stock de una variante específica
    updateStockVariante: async (id_comercio, id_variante, data) => {
        const response = await api.put(`/inventarios/${id_comercio}/variantes/${id_variante}`, data);
        return response.data;
    }
};

export default inventarioService;
