import api from '../api/api';

export const rectificacionesService = {
    // ─── RECTIFICACIONES DIRECTAS ──────────────────────────────────

    rectificarVenta: async ({
        id_venta,
        nuevos_detalles,
        metodo_pago,
        motivo,
        id_tipo_rectificacion,
        motivo_libre,
        observaciones,
        es_anulacion_total
    }) => {
        const response = await api.post('/rectificaciones/ventas', {
            id_venta,
            nuevos_detalles,
            metodo_pago,
            motivo,
            id_tipo_rectificacion,
            motivo_libre,
            observaciones,
            es_anulacion_total
        });
        return response.data;
    },

    // ─── TIPOS DE RECTIFICACIÓN ────────────────────────────────────

    getTipos: async () => {
        const response = await api.get('/rectificaciones/tipos');
        return response.data;
    },

    seedTiposYMotivos: async () => {
        const response = await api.post('/rectificaciones/seed');
        return response.data;
    },

    // ─── HISTORIAL Y CADENA ────────────────────────────────────────

    getHistorialVenta: async (id_venta) => {
        const response = await api.get(`/rectificaciones/ventas/${id_venta}/historial`);
        return response.data;
    },

    getCadenaVentas: async (id_venta) => {
        const response = await api.get(`/rectificaciones/ventas/${id_venta}/cadena`);
        return response.data;
    },

    rectificarMovimiento: async ({ id_movimiento, nuevos_items, motivo }) => {
        const response = await api.post('/rectificaciones/movimientos', { id_movimiento, nuevos_items, motivo });
        return response.data;
    },

    // ─── SOLICITUDES (FLUJO APROBACIÓN) ────────────────────────────

    crearSolicitud: async ({ tipo_entidad, id_entidad, id_comercio, motivo, datos_corregidos }) => {
        const response = await api.post('/rectificaciones/solicitudes', { tipo_entidad, id_entidad, id_comercio, motivo, datos_corregidos });
        return response.data;
    },

    getPendientes: async () => {
        const response = await api.get('/rectificaciones/solicitudes/pendientes');
        return response.data;
    },

    getHistorial: async () => {
        const response = await api.get('/rectificaciones/solicitudes/historial');
        return response.data;
    },

    aprobar: async (id_solicitud) => {
        const response = await api.post(`/rectificaciones/solicitudes/${id_solicitud}/aprobar`);
        return response.data;
    },

    rechazar: async (id_solicitud, motivo_rechazo) => {
        const response = await api.post(`/rectificaciones/solicitudes/${id_solicitud}/rechazar`, { motivo_rechazo });
        return response.data;
    },

    // ─── UTILIDADES ────────────────────────────────────────────────

    getVenta: async (id_venta) => {
        const response = await api.get(`/ventas/${id_venta}`);
        return response.data;
    },

    getVentas: async () => {
        const response = await api.get('/rectificaciones/ventas');
        return response.data;
    },

    getMovimientos: async (params = {}) => {
        const response = await api.get('/movimientos', { params });
        return response.data;
    }
};
