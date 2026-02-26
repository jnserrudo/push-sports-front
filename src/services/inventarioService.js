import api from '../api/api';

export const inventarioService = {
    // El backend NO tiene GET /inventarios genérico.
    // Solo tiene GET /inventarios/:id_comercio
    // Para "getAll" de SUPER_ADMIN, obtenemos comercios y luego su inventario.
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
                } catch {
                    // Si un comercio falla, continuar con los demás
                }
            }
            return allInventarios;
        } catch {
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
    }
};
