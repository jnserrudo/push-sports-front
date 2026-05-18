import api from '../api/api';

export const auditoriaService = {
    // Obtener auditoría con filtros avanzados
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams();
        
        if (params.entidad) queryParams.append('entidad', params.entidad);
        if (params.accion) queryParams.append('accion', params.accion);
        if (params.usuario) queryParams.append('usuario', params.usuario);
        if (params.usuario_real) queryParams.append('usuario_real', params.usuario_real);
        if (params.usuario_impersonado) queryParams.append('usuario_impersonado', params.usuario_impersonado);
        if (params.comercio) queryParams.append('comercio', params.comercio);
        if (params.producto) queryParams.append('producto', params.producto);
        if (params.venta) queryParams.append('venta', params.venta);
        if (params.proveedor) queryParams.append('proveedor', params.proveedor);
        if (params.id_entidad) queryParams.append('id_entidad', params.id_entidad);
        if (params.busqueda) queryParams.append('busqueda', params.busqueda);
        if (params.desde) queryParams.append('desde', params.desde);
        if (params.hasta) queryParams.append('hasta', params.hasta);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.offset) queryParams.append('offset', params.offset);
        
        const url = `/auditoria${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await api.get(url);
        return response.data;
    },

    // Obtener auditoría por tipo de entidad
    getByEntidad: async (nombreEntidad, idEntidad = null) => {
        const queryParams = new URLSearchParams();
        if (idEntidad) queryParams.append('id_entidad', idEntidad);
        
        const url = `/auditoria/entidad/${nombreEntidad}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await api.get(url);
        return response.data;
    },

    // Obtener historial completo de una entidad específica
    getHistorial: async (entidad, id) => {
        const response = await api.get(`/auditoria/historial/${entidad}/${id}`);
        return response.data;
    },

    // Obtener estadísticas de auditoría
    getEstadisticas: async (desde = null, hasta = null) => {
        const queryParams = new URLSearchParams();
        if (desde) queryParams.append('desde', desde);
        if (hasta) queryParams.append('hasta', hasta);
        
        const url = `/auditoria/estadisticas/resumen${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await api.get(url);
        return response.data;
    }
};
