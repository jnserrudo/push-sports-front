import api from '../api/api';

export const enviosService = {
    // Obtener todos los movimientos de stock con filtros y paginación
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams();
        
        if (params.desde) queryParams.append('desde', params.desde);
        if (params.hasta) queryParams.append('hasta', params.hasta);
        if (params.id_usuario) queryParams.append('id_usuario', params.id_usuario);
        if (params.id_tipo_movimiento) queryParams.append('id_tipo_movimiento', params.id_tipo_movimiento);
        if (params.id_producto) queryParams.append('id_producto', params.id_producto);
        if (params.busqueda) queryParams.append('busqueda', params.busqueda);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.offset) queryParams.append('offset', params.offset);

        const rawSucId = params.sucursalId;
        const sucursalId = typeof rawSucId === 'object' ? rawSucId?.id_comercio : rawSucId;

        const endpoint = sucursalId 
            ? `/movimientos/comercio/${sucursalId}${queryParams.toString() ? '?' + queryParams.toString() : ''}` 
            : `/movimientos${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        const response = await api.get(endpoint);
        return response.data;
    },

    // Crear un envío (movimiento de stock tipo ingreso)
    crearEnvio: async (sucursalId, productoId, cantidad) => {
        // Usamos el endpoint de inventario para actualizar stock
        // Buscamos el inventario del comercio+producto y actualizamos
        const response = await api.post('/movimientos', {
            id_comercio: sucursalId,
            id_producto: productoId,
            cantidad_cambio: Number(cantidad),
            id_tipo_movimiento: 1 // Tipo 1 = Ingreso/Envío
        });
        return response.data;
    },

    // Crear un envío con desglose de variantes
    // items_variantes = [{id_variante, cantidad}, ...]
    crearEnvioConVariantes: async (sucursalId, productoId, itemsVariantes) => {
        const cleanSid = typeof sucursalId === 'object' ? sucursalId?.id_comercio : sucursalId;
        const response = await api.post('/movimientos/con-variantes', {
            id_comercio: cleanSid,
            id_producto: productoId,
            items_variantes: itemsVariantes,
            id_tipo_movimiento: 1 // Tipo 1 = Ingreso/Envío
        });
        return response.data;
    }
};
