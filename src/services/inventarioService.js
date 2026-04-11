import api from '../api/api';

export const inventarioService = {
    // El backend NO tiene GET /inventarios genérico.
    // Solo tiene GET /inventarios/:id_comercio
    // Para "getAll" de SUPER_ADMIN, obtenemos comercios y luego el inventario de cada uno.
    getAll: async () => {
        // Intentar obtener todos los comercios y luego el inventario de cada uno
        try {
            const comerciosRes = await api.get('/comercios');
            const comercios = comerciosRes.data || [];
            const allInventarios = [];
            for (const comercio of comercios) {
                try {
                    const invRes = await api.get(`/inventarios/${comercio.id_comercio}`);
                    const items = (invRes.data || []).map(item => ({
                        ...item,
                        sucursal_nombre: comercio.nombre
                    }));
                    allInventarios.push(...items);
                } catch (err) {
                    console.error(`Error cargando inventario para comercio ${comercio.id_comercio}:`, err);
                }
            }
            console.log('Total inventarios cargados:', allInventarios.length);
            return allInventarios;
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
